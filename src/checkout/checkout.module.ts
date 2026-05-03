import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import {NotificationModule} from "../notification/notification.module";
import { Notification } from "../common/entities/notifications.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    NotificationModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}