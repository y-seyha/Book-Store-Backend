import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.carts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
}