import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Order} from "./order.entity";
import {Product} from "./product.entity";

@Entity('order_items')
export class OrderItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    product: Product;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: 'pending' })
    status: string;
}