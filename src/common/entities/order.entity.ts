import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn, OneToOne
} from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import {DeliveryTracking} from "./delivery-tracking.entity";

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    total_price: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @Column({ nullable: true })
    shipping_name: string;

    @Column({ nullable: true })
    shipping_phone: string;

    @Column({ nullable: true })
    shipping_address: string;

    @Column({ nullable: true })
    shipping_city: string;

    @OneToMany(() => OrderItem, item => item.order)
    items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => DeliveryTracking, tracking => tracking.order, {
        cascade: true,
    })
    tracking: DeliveryTracking;
}