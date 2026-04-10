import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('contact_messages')
export class ContactMessage extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 150 })
    email: string;

    @Column({ type: 'varchar', length: 200 })
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'boolean', default: false })
    sent_to_telegram: boolean;
}