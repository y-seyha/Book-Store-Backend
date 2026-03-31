import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    user: User;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: 0 })
    stock: number;

    @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
    category: Category;

    @Column({ nullable: true })
    image_url: string;

    @Column({ nullable: true })
    image_public_id: string;
}