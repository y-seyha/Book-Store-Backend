import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { Order } from "./order.entity";
import { DeliveryTracking } from "./delivery-tracking.entity";

export type NotificationType = "order" | "delivery" | "system";

@Entity("notifications")
@Index(["userId", "isRead"])
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.notifications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({
        type: "enum",
        enum: ["order", "delivery", "system"],
    })
    type: NotificationType;

    @Column({ type: "text" })
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ nullable: true })
    orderId?: number;

    @ManyToOne(() => Order, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "orderId" })
    order?: Order;

    @Column({ nullable: true })
    deliveryTrackingId?: number;

    @ManyToOne(() => DeliveryTracking, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "deliveryTrackingId" })
    tracking?: DeliveryTracking;

    @Column({ nullable: true })
    link?: string;
}