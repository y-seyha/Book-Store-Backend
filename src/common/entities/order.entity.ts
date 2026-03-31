import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    total_price: number;

    @Column({ default: 'pending' })
    status: string;

    @Column({ nullable: true })
    shipping_name: string;

    @Column({ nullable: true })
    shipping_phone: string;

    @Column({ nullable: true })
    shipping_address: string;

    @Column({ nullable: true })
    shipping_city: string;
}