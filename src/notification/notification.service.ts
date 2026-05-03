import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../common/entities/notifications.entity";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
    ) {}

    async findByUser(userId: string, limit = 50) {
        return this.notificationRepo.find({
            where: { userId },
            order: { created_at: "DESC" },
            take: limit,
        });
    }

    async markAsRead(id: string, userId: string) {
        const result = await this.notificationRepo.update(
            { id, userId },
            { isRead: true }
        );

        if (result.affected === 0) {
            throw new NotFoundException("Notification not found");
        }

        return { success: true };
    }

    async markAllAsRead(userId: string) {
        await this.notificationRepo.update(
            { userId, isRead: false },
            { isRead: true }
        );

        return { success: true };
    }

    async unreadCount(userId: string) {
        return this.notificationRepo.count({
            where: { userId, isRead: false },
        });
    }
}