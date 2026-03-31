import {
    Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, type: 'citext' })
    email: string;

    @Column({ nullable: true })
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({
        default: 'customer',
    })
    role: 'customer' | 'admin' | 'seller';

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar_url: string;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ length: 6, nullable: true })
    email_verification_otp: string;

    @Column({ nullable: true })
    email_verification_token: string;

    @Column({ type: 'timestamptz', nullable: true })
    email_verification_expires: Date;

    @Column({ nullable: true })
    password_reset_token: string;

    @Column({ type: 'timestamptz', nullable: true })
    password_reset_expires: Date;

    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[];
}