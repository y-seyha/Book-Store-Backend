import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Payment, PaymentStatus} from "../common/entities/payment.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {QueryPaymentDto} from "./dto/query-payment.dto";
import {UpdatePaymentStatusDto} from "./dto/update-payment-status.dto";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,
    ) {
    }

    async findAll(query: QueryPaymentDto) {
        const qb = this.paymentRepo
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.order', 'order')
            .leftJoinAndSelect('order.user', 'user')
            .orderBy('payment.id', 'DESC');

        if (query.status) {
            qb.andWhere('payment.status = :status', { status: query.status });
        }

        if (query.method) {
            qb.andWhere('payment.method = :method', { method: query.method });
        }

        if (query.search) {
            qb.andWhere(
                `(CAST(order.id AS TEXT) ILIKE :search OR user.email ILIKE :search OR CAST(payment.id AS TEXT) ILIKE :search)`,
                { search: `%${query.search}%` },
            );
        }

        return qb.getMany();
    }

    async findOne(id: number) {
        const payment = await this.paymentRepo.findOne({
            where: { id },
            relations: ['order', 'order.user'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async updateStatus(id: number, dto: UpdatePaymentStatusDto) {
        const payment = await this.findOne(id);

        if (payment.status === PaymentStatus.SUCCESS) {
            throw new BadRequestException('Payment already confirmed');
        }

        if (payment.status === PaymentStatus.FAILED) {
            throw new BadRequestException('Payment already rejected');
        }

        payment.status = dto.status;

        // set paid_at only when SUCCESS
        if (dto.status === PaymentStatus.SUCCESS) {
            payment.paid_at = new Date();
        }

        return this.paymentRepo.save(payment);
    }

    async confirmPayment(id: number) {
        const payment = await this.findOne(id);

        payment.status = PaymentStatus.SUCCESS;
        payment.paid_at = new Date();

        return this.paymentRepo.save(payment);
    }

    async rejectPayment(id: number) {
        const payment = await this.findOne(id);

        payment.status = PaymentStatus.FAILED;

        return this.paymentRepo.save(payment);
    }



}
