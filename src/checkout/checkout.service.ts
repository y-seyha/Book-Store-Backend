import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Product } from '../common/entities/product.entity';
import { CartItem } from '../common/entities/cart-item.entity';
import { Payment, PaymentStatus } from '../common/entities/payment.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { User } from '../common/entities/user.entity';
import {Cart} from "../common/entities/cart..entity";

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

            if (!cart || !cart.items.length) {
                throw new BadRequestException('Cart is empty');
            }

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
            for (const cartItem of cart.items) {
                const product = cartItem.product;

                if (!product) throw new NotFoundException(`Product ${cartItem.product.id} not found`);
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
            }

            await manager.save(orderItems);

            order.total_price = total.toFixed(2);
            await manager.save(order);

            //  Create payment
            const payment = manager.create(Payment, {
                order,
                amount: order.total_price,
                method: dto.payment_method,
                status: PaymentStatus.PENDING
            });
            await manager.save(payment);

            //  Clear cart
            await manager.remove(cart.items);
            await manager.remove(cart);

            return {
                order,
                payment
            };
        });
    }
}