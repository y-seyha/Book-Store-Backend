import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Product } from '../common/entities/product.entity';
import { Cart } from '../common/entities/cart..entity';
import { CartItem } from '../common/entities/cart-item.entity';
import { Payment } from '../common/entities/payment.entity';
import {DeliveryTracking} from "../common/entities/delivery-tracking.entity";
import {DriverProfile} from "../common/entities/driver_profile.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Cart, CartItem, Payment, DeliveryTracking,DriverProfile])
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}