import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn
} from "typeorm";
import { Order } from "./order.entity";
import {BaseEntity} from "./base.entity";


export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed'
}

export enum PaymentMethod {
    COD = 'cod',
    ABA = 'aba',
    CARD = 'card'
}

@Entity('payments')
export class Payment extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod
    })
    method: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ type: 'timestamp', nullable: true })
    paid_at: Date;
}