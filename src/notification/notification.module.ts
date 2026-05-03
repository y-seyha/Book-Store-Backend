import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import { Notification } from "../common/entities/notifications.entity";

@Module({  imports : [
        TypeOrmModule.forFeature([Notification])
    ],
    providers: [NotificationGateway, NotificationService],
    exports: [NotificationGateway],
    controllers: [NotificationController],
})
export class NotificationModule {}