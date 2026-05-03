import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { Order } from "../common/entities/order.entity";
import { OrderItem } from "../common/entities/order-item.entity";
import { CartItem } from "../common/entities/cart-item.entity";
import { Payment, PaymentStatus } from "../common/entities/payment.entity";
import { CheckoutDto } from "./dto/checkout.dto";
import { User } from "../common/entities/user.entity";
import { Cart } from "../common/entities/cart..entity";
import {
    DeliveryStatus,
    DeliveryTracking,
} from "../common/entities/delivery-tracking.entity";
import { DriverProfile } from "../common/entities/driver_profile.entity";
import { Notification } from "../common/entities/notifications.entity";
import { NotificationGateway } from "../notification/notification.gateway";

@Injectable()
export class CheckoutService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,

        private notificationGateway: NotificationGateway,

        private dataSource: DataSource,
    ) {}


    async checkout(userId: string, dto: CheckoutDto) {
        const result = await this.dataSource.transaction(async (manager) => {
            const user = await manager.findOne(User, {
                where: { id: userId },
            });

            if (!user) throw new NotFoundException("User not found");

            const cart = await manager.findOne(Cart, {
                where: { user: { id: userId } },
                relations: ["items", "items.product"],
            });

            if (!cart || !cart.items.length) {
                throw new BadRequestException("Cart is empty");
            }

            const activeItems = cart.items.filter(
                (item) => item.status === "active",
            ) as CartItem[];

            if (!activeItems.length) {
                throw new BadRequestException("No active items to checkout");
            }

            let total = 0;

            const order = manager.create(Order, {
                user,
                shipping_name: dto.shipping_name,
                shipping_phone: dto.shipping_phone,
                shipping_address: dto.shipping_address,
                shipping_city: dto.shipping_city,
                total_price: "0",
            });

            await manager.save(order);

            const orderItems: OrderItem[] = [];

            for (const cartItem of activeItems) {
                const product = cartItem.product;

                if (!product) {
                    throw new NotFoundException("Product not found");
                }

                if (product.stock < cartItem.quantity) {
                    throw new BadRequestException(
                        `Not enough stock for ${product.name}`,
                    );
                }

                product.stock -= cartItem.quantity;
                await manager.save(product);

                const orderItem = manager.create(OrderItem, {
                    order,
                    product,
                    quantity: cartItem.quantity,
                    price: product.price.toString(),
                });

                orderItems.push(orderItem);

                total += Number(product.price) * cartItem.quantity;

                cartItem.status = "purchased";
                await manager.save(cartItem);
            }

            await manager.save(orderItems);

            order.total_price = total.toFixed(2);
            await manager.save(order);

            const payment = manager.create(Payment, {
                order,
                amount: order.total_price,
                method: dto.payment_method,
                status: PaymentStatus.PENDING,
            });

            await manager.save(payment);

            const driverProfile = await manager.findOne(DriverProfile, {
                where: { is_available: true },
                relations: ["user"],
            });

            if (!driverProfile) {
                throw new BadRequestException("No available driver");
            }

            driverProfile.is_available = false;
            await manager.save(driverProfile);

            const tracking = manager.create(DeliveryTracking, {
                order,
                order_id: order.id,
                driverProfile,
                status: DeliveryStatus.PREPARING,
            });

            await manager.save(tracking);

            const fullTracking = await manager.findOne(DeliveryTracking, {
                where: { id: tracking.id },
                relations: {
                    order: true,
                    driverProfile: { user: true },
                },
            });

            await this.createNotification(manager, {
                userId,
                type: "order",
                message: `Your order #${order.id} has been placed successfully`,
                link: `/orders/${order.id}`,
            });

            this.notificationGateway.sendToUser(userId, "order_created", {
                orderId: order.id,
                total: order.total_price,
            });

            // Driver notification
            if (driverProfile?.user?.id) {
                await this.createNotification(manager, {
                    userId: driverProfile.user.id,
                    type: "delivery",
                    message: `New delivery assigned (Order #${order.id})`,
                    link: `/driver/orders/${order.id}`,
                });

                this.notificationGateway.sendToUser(
                    driverProfile.user.id,
                    "new_delivery",
                    {
                        orderId: order.id,
                        customer: `${user.first_name} ${user.last_name}`,
                        address: dto.shipping_address,
                    },
                );
            }

            return {
                order,
                payment,
                tracking: fullTracking,
                driverId: driverProfile.user.id,
            };
        });

        return result;
    }

    async findByUser(userId: string) {
        return this.notificationRepo.find({
            where: { userId },
            order: { created_at: "DESC" }
        });
    }

    private async createNotification(
        manager: any,
        payload: {
            userId: string;
            type: "order" | "delivery" | "system";
            message: string;
            link?: string;
        },
    ) {
        const notification = manager.create(Notification, {
            userId: payload.userId,
            type: payload.type,
            message: payload.message,
            link: payload.link,
            isRead: false,
        });

        return manager.save(notification);
    }
}