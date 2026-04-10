
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ReviewModule } from './review/review.module';
import { SellerModule } from './seller/seller.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import * as Joi from 'joi';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {APP_GUARD} from "@nestjs/core";
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
      ThrottlerModule.forRoot([
        {
          ttl: 60,    // 60 seconds
          limit: 20,
        }
      ])
      ,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/common/entities/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    AuthModule,
    ProductsModule,
    CartModule,
    OrderModule,
    CheckoutModule,
    ReviewModule,
    SellerModule,
    FileUploadModule,
    ContactModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, //global
    },
  ],
})
export class AppModule {}