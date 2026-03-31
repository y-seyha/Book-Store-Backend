import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Order} from "./order.entity";

@Entity('payments')
export class Payment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    order: Order;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    method: string;

    @Column({ default: 'pending' })
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    paid_at: Date;
}