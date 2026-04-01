import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";

export enum OrderItemStatus {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    CANCELLED = 'cancelled'
}

@Entity('order_items')
export class OrderItem extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    quantity: number;

    // ⚠️ decimal = string
    @Column('decimal', { precision: 10, scale: 2 })
    price: string;

    @Column({
        type: 'enum',
        enum: OrderItemStatus,
        default: OrderItemStatus.PENDING
    })
    status: OrderItemStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}