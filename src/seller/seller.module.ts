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
import {CacheModule} from "@nestjs/cache-manager";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
      TypeOrmModule.forFeature([Seller, User, Order, OrderItem, Payment,Product]),
      CacheModule.register({ ttl: 60, max: 100 }),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '15m' },
        }),
      }),
  ],
  providers: [SellerService],
  controllers: [SellerController]
})
export class SellerModule {}
