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

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Cart, CartItem, Payment])
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService]
})
export class CheckoutModule {}