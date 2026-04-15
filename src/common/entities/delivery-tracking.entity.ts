import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Order} from "./order.entity";
import {User} from "./user.entity";
import {DriverProfile} from "./driver_profile.entity";


export enum DeliveryStatus {
    PREPARING = 'preparing',
    PICKED_UP = 'picked_up',
    ON_THE_WAY = 'on_the_way',
    NEARBY = 'nearby',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export enum DeliveryResult {
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

@Entity('delivery_tracking')
export class DeliveryTracking extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column()
    order_id: number;


    @Column('decimal', { precision: 10, scale: 6, nullable: true })
    latitude: string;

    @Column('decimal', { precision: 10, scale: 6, nullable: true })
    longitude: string;

    @Column({
        type: 'enum',
        enum: DeliveryStatus,
        default: DeliveryStatus.PREPARING
    })
    status: DeliveryStatus;

    @Column({
        type: 'enum',
        enum: DeliveryResult,
        nullable: true
    })
    result: DeliveryResult;

    @Column({ nullable: true })
    failure_reason: string;

    @ManyToOne(() => DriverProfile, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'driver_profile_id' })
    driverProfile: DriverProfile | null;
}

