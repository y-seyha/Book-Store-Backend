import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;
}