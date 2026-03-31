import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('accounts')
@Unique(['provider', 'provider_account_id'])
export class Account extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.accounts, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Column()
    provider: string;

    @Column()
    provider_account_id: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ nullable: true })
    access_token: string;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ type: 'timestamptz', nullable: true })
    token_expires_at: Date;
}