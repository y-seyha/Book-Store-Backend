import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Order, OrderStatus } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Product } from '../common/entities/product.entity';
import {DeliveryStatus, DeliveryTracking} from '../common/entities/delivery-tracking.entity';

import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,

        @InjectRepository(OrderItem)
        private orderItemRepo: Repository<OrderItem>,

        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @InjectRepository(DeliveryTracking)
        private trackingRepo: Repository<DeliveryTracking>,

        private dataSource: DataSource,
    ) {}

    async findAll() {
        return this.orderRepo.find({
            relations: ['user', 'items', 'items.product'],
        });
    }

    async findMyOrders(userId: string) {
        return this.orderRepo.find({
            where: { user: { id: userId } },
            relations: ['user', 'items', 'items.product'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['user', 'items', 'items.product', 'tracking'],
        });

        if (!order) throw new NotFoundException('Order not found');

        return order;
    }


    async adminFindAll(query: QueryOrderDto) {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.tracking', 'tracking')
            .orderBy('order.created_at', 'DESC');

        if (query.status) {
            qb.andWhere('order.status = :status', {
                status: query.status,
            });
        }

        if (query.search) {
            qb.andWhere(
                '(CAST(order.id AS TEXT) ILIKE :search OR user.email ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        return qb.getMany();
    }

    async updateStatus(orderId: number, dto: UpdateOrderStatusDto) {
        return this.dataSource.transaction(async (manager) => {

            const order = await manager.findOne(Order, {
                where: { id: orderId },
                relations: ['tracking', 'items'],
            });

            if (!order) throw new NotFoundException('Order not found');

            if (order.status === OrderStatus.COMPLETED)
                throw new BadRequestException('Order already completed');

            if (order.status === OrderStatus.CANCELLED)
                throw new BadRequestException('Order already cancelled');

            order.status = dto.status;

            // sync tracking
            if (order.tracking) {
                const map = {
                    [OrderStatus.PENDING]: DeliveryStatus.PREPARING,
                    [OrderStatus.PAID]: DeliveryStatus.PREPARING,
                    [OrderStatus.SHIPPED]: DeliveryStatus.PICKED_UP,
                    [OrderStatus.COMPLETED]: DeliveryStatus.DELIVERED,
                    [OrderStatus.CANCELLED]: DeliveryStatus.CANCELLED,
                };

                order.tracking.status = map[dto.status];

                await manager.save(DeliveryTracking, order.tracking);
            }

            return manager.save(Order, order);
        });
    }

    async cancelOrder(orderId: number, dto: CancelOrderDto) {
        const order = await this.findOne(orderId);

        if (
            order.status === OrderStatus.SHIPPED ||
            order.status === OrderStatus.COMPLETED
        ) {
            throw new BadRequestException(
                'Cannot cancel shipped/completed order',
            );
        }

        order.status = OrderStatus.CANCELLED;

        return this.orderRepo.save(order);
    }

    async updateOrderItem(orderId: number, itemId: number, dto: UpdateOrderItemDto) {
        return this.dataSource.transaction(async (manager) => {

            const order = await manager.findOne(Order, {
                where: { id: orderId },
                relations: ['items'],
            });

            if (!order) throw new NotFoundException('Order not found');

            const item = order.items.find(i => i.id === itemId);

            if (!item) throw new BadRequestException('Order item not found');

            item.status = dto.status;

            await manager.save(OrderItem, item);

            const items = order.items;

            const allFulfilled = items.every(i => i.status === 'fulfilled');
            const allCancelled = items.every(i => i.status === 'cancelled');

            if (allFulfilled) {
                order.status = OrderStatus.COMPLETED;
            }

            if (allCancelled) {
                order.status = OrderStatus.CANCELLED;
            }

            await manager.save(Order, order);

            if (order.tracking) {
                if (allFulfilled) {
                    order.tracking.status = DeliveryStatus.DELIVERED;
                }

                if (allCancelled) {
                    order.tracking.status = DeliveryStatus.CANCELLED;
                }

                await manager.save(DeliveryTracking, order.tracking);
            }

            return item;
        });
    }
}