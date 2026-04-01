import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../common/entities/product.entity";
import {Category} from "../common/entities/category.entity";
import {User} from "../common/entities/user.entity";
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
      TypeOrmModule.forFeature([Product, Category,User ]),
      CacheModule.register({ ttl: 60, max: 100 })
  ],

  providers: [ProductsService],
  controllers: [ProductsController],
  exports : [ProductsService]
})
export class ProductsModule {

}
