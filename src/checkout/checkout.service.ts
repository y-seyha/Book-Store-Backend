import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {Order} from '../common/entities/order.entity';
import {OrderItem} from '../common/entities/order-item.entity';
import {Product} from '../common/entities/product.entity';
import {CartItem} from '../common/entities/cart-item.entity';
import {Payment, PaymentStatus} from '../common/entities/payment.entity';
import {CheckoutDto} from './dto/checkout.dto';
import {User} from '../common/entities/user.entity';
import {Cart} from "../common/entities/cart..entity";
import {DeliveryStatus, DeliveryTracking} from "../common/entities/delivery-tracking.entity";
import {DriverProfile} from "../common/entities/driver_profile.entity";

@Injectable()
export class CheckoutService {
    constructor(
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,

        @InjectRepository(OrderItem)
        private orderItemRepo: Repository<OrderItem>,

        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @InjectRepository(Cart)
        private cartRepo: Repository<Cart>,

        @InjectRepository(CartItem)
        private cartItemRepo: Repository<CartItem>,

        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,

        @InjectRepository(DeliveryTracking)
        private deliveryTrackingRepo : Repository<DeliveryTracking>,

        @InjectRepository(DriverProfile)
        private driverRepo: Repository<DriverProfile>,

        private dataSource: DataSource
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        return this.dataSource.transaction(async manager => {

            const user = await manager.findOne(User, { where: { id: userId } });
            if (!user) throw new NotFoundException('User not found');

            const cart = await manager.findOne(Cart, {
                where: { user: { id: userId } },
                relations: ['items', 'items.product']
            });

            if (!cart) throw new BadRequestException('Cart is empty');

            // Filter only active items
            const activeItems = cart.items.filter(item => item.status === 'active') as CartItem[];
            if (!activeItems.length) throw new BadRequestException('No new items to checkout');

            // Create order
            let total = 0;
            const order = manager.create(Order, {
                user,
                shipping_name: dto.shipping_name,
                shipping_phone: dto.shipping_phone,
                shipping_address: dto.shipping_address,
                shipping_city: dto.shipping_city,
                total_price: '0'
            });
            await manager.save(order);

            // Create order items & reduce stock
            const orderItems: OrderItem[] = [];
            for (const cartItem of activeItems) {
                const product = cartItem.product;

                if (!product) throw new NotFoundException(`Product not found`);
                if (product.stock < cartItem.quantity) {
                    throw new BadRequestException(`Not enough stock for product ${product.name}`);
                }

                // reduce stock
                product.stock -= cartItem.quantity;
                await manager.save(product);

                const orderItem = manager.create(OrderItem, {
                    order,
                    product,
                    quantity: cartItem.quantity,
                    price: product.price.toString()
                });
                orderItems.push(orderItem);

                total += Number(product.price) * cartItem.quantity;

                // Mark cart item as purchased
                cartItem.status = 'purchased';
                await manager.save(cartItem);
            }

            await manager.save(orderItems);

            order.total_price = total.toFixed(2);
            await manager.save(order);

            // Create payment
            const payment = manager.create(Payment, {
                order,
                amount: order.total_price,
                method: dto.payment_method,
                status: PaymentStatus.PENDING
            });
            await manager.save(payment);

            const driverRepo = manager.getRepository(DriverProfile);

            const driverProfile = await driverRepo.findOne({
                where: { is_available: true },
                relations: ['user']
            });
            if (!driverProfile) {
                throw new BadRequestException('No available driver right now');
            }

            const tracking = manager.create(DeliveryTracking, {
                order,
                order_id: order.id,
                driverProfile: driverProfile,
                status: DeliveryStatus.PREPARING
            });

            driverProfile.is_available = false;
            await manager.save(driverProfile);

            await manager.save(tracking);

            const fullTracking = await manager.findOne(DeliveryTracking, {
                where: { id: tracking.id },
                relations: {
                    order: true,
                    driverProfile: {
                        user: true
                    }
                }
            });

            return {
                order,
                payment,
                tracking: fullTracking
            };
        });
    }
}