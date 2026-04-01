import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from '../common/entities/review.entity';
import { Product } from '../common/entities/product.entity';
import {CacheModule} from "@nestjs/cache-manager";
import {User} from "../common/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Product,User]),
        CacheModule.register({ ttl: 60, max: 100 })
    ],
    controllers: [ReviewController],
    providers: [ReviewService],
})
export class ReviewModule {}