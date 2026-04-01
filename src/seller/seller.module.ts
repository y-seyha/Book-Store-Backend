import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Seller} from "../common/entities/seller.entity";
import {User} from "../common/entities/user.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([Seller, User]),
  ],
  providers: [SellerService],
  controllers: [SellerController]
})
export class SellerModule {}
