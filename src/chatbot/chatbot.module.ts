import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatbotService } from './chatbot.service';
import { ChatbotContextService } from './chatbot-context.service';
import { ChatbotProductsService } from './chatbot-products.service';

import { ChatbotController } from './chatbot.controller';

import { ChatSession } from '../common/entities/chat_sessions.entity';
import { ChatMessage } from '../common/entities/chat-message.entity';
import { Product } from '../common/entities/product.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Category } from '../common/entities/category.entity';
import { Review } from '../common/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      ChatMessage,
      Product,
      OrderItem,
      Category,
      Review,
    ]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotContextService, ChatbotProductsService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
