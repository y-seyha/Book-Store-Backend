import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, type: 'citext' })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    first_name: string | null;

    @Column({ type: 'varchar', nullable: true })
    last_name: string | null;

    @Column({ type: 'varchar', default: 'customer' })
    role: 'customer' | 'admin' | 'seller';

    @Column({ type: 'varchar', nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', nullable: true })
    avatar_url: string | null;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ type: 'varchar', length: 6, nullable: true })
    email_verification_otp: string | null;

    @Column({ type: 'varchar', nullable: true })
    email_verification_token: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    email_verification_expires: Date | null;

    @Column({ type: 'varchar', nullable: true })
    password_reset_token: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    password_reset_expires: Date | null;

    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[];
}