import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';

import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { User } from '../common/entities/user.entity';
import { Payment, PaymentStatus } from '../common/entities/payment.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
    ) {}

    async getDashboard() {
        const [
            totalSales,
            totalOrders,
            activeUsers,
            topProducts,
            revenueChart,
        ] = await Promise.all([
            this.getTotalSales(),
            this.getTotalOrders(),
            this.getActiveUsers(),
            this.getTopProducts(),
            this.getRevenueChart(),
        ]);

        return {
            totalSales,
            totalOrders,
            activeUsers,
            topProducts,
            revenueChart,
        };
    }

    private async getTotalSales(): Promise<number> {
        const result = await this.paymentRepo
            .createQueryBuilder('payment')
            .select('COALESCE(SUM(payment.amount), 0)', 'total')
            .where('payment.status = :status', {
                status: PaymentStatus.SUCCESS,
            })
            .getRawOne();

        return Number(result.total);
    }

    private async getTotalOrders(): Promise<number> {
        return this.orderRepo.count();
    }

    private async getActiveUsers(): Promise<number> {
        return this.userRepo.count({
            where: {
                role: 'customer',
            },
        });
    }

    private async getTopProducts() {
        return this.orderItemRepo
            .createQueryBuilder('item')
            .leftJoin('item.product', 'product')
            .select('product.id', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('COALESCE(SUM(item.quantity), 0)', 'totalSold')
            .where('product.id IS NOT NULL')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .orderBy('SUM(item.quantity)', 'DESC')
            .limit(5)
            .getRawMany();
    }

    private async getRevenueChart() {
        return this.paymentRepo
            .createQueryBuilder('payment')
            .select(`DATE(payment.paid_at)`, 'date')
            .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
            .where('payment.status = :status', {
                status: PaymentStatus.SUCCESS,
            })
            .andWhere('payment.paid_at IS NOT NULL')
            .andWhere(`payment.paid_at >= NOW() - INTERVAL '7 days'`)
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();
    }
}