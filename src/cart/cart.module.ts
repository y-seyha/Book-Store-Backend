import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CartItem} from "../common/entities/cart-item.entity";
import {Cart} from "../common/entities/cart..entity";
import {Product} from "../common/entities/product.entity";
import {User} from "../common/entities/user.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([Cart,CartItem, Product, User]),
  ],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
