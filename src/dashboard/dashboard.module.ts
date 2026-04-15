import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Order} from "../common/entities/order.entity";
import {Payment} from "../common/entities/payment.entity";
import {User} from "../common/entities/user.entity";
import {OrderItem} from "../common/entities/order-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment, User, OrderItem]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],

})
export class DashboardModule {}
