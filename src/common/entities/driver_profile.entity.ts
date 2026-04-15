import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('driver_profiles')
export class DriverProfile extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    plate_number: string;

    @Column({ nullable: true })
    vehicle_type: string;

    @Column({ default: true })
    is_available: boolean;

    @Column({ nullable: true })
    current_lat: string;

    @Column({ nullable: true })
    current_lng: string;
}