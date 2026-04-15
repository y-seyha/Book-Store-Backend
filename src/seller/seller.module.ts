import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Seller} from "../common/entities/seller.entity";
import {User} from "../common/entities/user.entity";
import {Order} from "../common/entities/order.entity";
import {OrderItem} from "../common/entities/order-item.entity";
import {Payment} from "../common/entities/payment.entity";
import {Product} from "../common/entities/product.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([Seller, User, Order, OrderItem, Payment,Product]),
  ],
  providers: [SellerService],
  controllers: [SellerController]
})
export class SellerModule {}
