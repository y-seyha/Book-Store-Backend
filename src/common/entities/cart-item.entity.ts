import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Cart} from "./cart..entity";
import {Product} from "./product.entity";

@Entity('cart_items')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
    cart: Cart;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    product: Product;

    @Column()
    quantity: number;
}