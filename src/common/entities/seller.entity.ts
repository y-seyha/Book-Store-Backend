import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('sellers')
export class Seller extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    store_name: string;

    @Column({ nullable: true })
    store_description: string;

    @Column({ nullable: true })
    store_address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    logo_url: string;
}