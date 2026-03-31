import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Product} from "./product.entity";
import {User} from "./user.entity";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    product: Product;

    @Column()
    rating: number;

    @Column({ nullable: true })
    comment: string;
}