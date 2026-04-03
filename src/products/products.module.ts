import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../common/entities/product.entity";
import {File} from "../common/entities/file-upload.entity"
import {Category} from "../common/entities/category.entity";
import {User} from "../common/entities/user.entity";
import {CacheModule} from "@nestjs/cache-manager";
import {FileUploadModule} from "../file-upload/file-upload.module";

@Module({
  imports: [
      TypeOrmModule.forFeature([Product, Category,User, File ]),
      CacheModule.register({ ttl: 60, max: 100 }),
      FileUploadModule
  ],

  providers: [ProductsService],
  controllers: [ProductsController],
  exports : [ProductsService]
})
export class ProductsModule {

}
