import { Module } from '@nestjs/common';
import { DeliveryTrackingController } from './delivery_tracking.controller';
import { DeliveryTrackingService } from './delivery_tracking.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DeliveryTracking} from "../common/entities/delivery-tracking.entity";
import {DriverProfile} from "../common/entities/driver_profile.entity";
import {Order} from "../common/entities/order.entity";
import {NotificationModule} from "../notification/notification.module";
import { Notification } from "../common/entities/notifications.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryTracking,DriverProfile, Order, Notification ]),
    NotificationModule
  ],
  controllers: [DeliveryTrackingController],
  providers: [DeliveryTrackingService],
  exports: [DeliveryTrackingService],
})
export class DeliveryTrackingModule {}
