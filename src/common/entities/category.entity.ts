import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('categories')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;
}