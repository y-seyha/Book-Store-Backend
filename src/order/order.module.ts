import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Order} from "../common/entities/order.entity";
import {OrderItem} from "../common/entities/order-item.entity";
import {Product} from "../common/entities/product.entity";
import {DeliveryTracking} from "../common/entities/delivery-tracking.entity";

@Module({
  imports : [
      TypeOrmModule.forFeature([Order, OrderItem, Product, DeliveryTracking])
  ],
  providers: [OrderService],
  controllers: [OrderController],
    exports: [OrderService]
})
export class OrderModule {}
