import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../common/entities/product.entity';
import { Category } from '../common/entities/category.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Review } from '../common/entities/review.entity';
import { ChatbotProductsService } from './chatbot-products.service';

export interface ChatbotContext {
  products: Product[];
  categories: Category[];
  trending: any[];
  recentOrders: any[];
  topRated: any[];
  reviews: Review[];
}

@Injectable()
export class ChatbotContextService {
  constructor(
    private readonly productService: ChatbotProductsService,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async buildContext(message: string): Promise<ChatbotContext> {
    const m = message.toLowerCase();
    const intent = this.resolveIntent(m);

    const context: ChatbotContext = {
      products: [],
      categories: [],
      trending: [],
      recentOrders: [],
      topRated: [],
      reviews: [],
    };

    switch (intent) {
      case 'cheap':
        context.products = await this.productService.getCheapProducts(10);
        break;

      case 'premium':
        context.products = await this.productService.getPremiumProducts(10);
        break;

      case 'latest':
        context.products = await this.productService.getLatestProducts(10);
        break;

      case 'top':
        context.trending = await this.productService.getTopProducts(10);
        break;

      case 'list':
        context.products = await this.productService.getSimpleProducts(10);
        break;

      default:
        context.products = await this.productService.smartSearch(m);
    }

    // fallback
    if (!context.products.length) {
      context.products = await this.productService.getSimpleProducts(10);
    }

    if (m.includes('category') || m.includes('genre')) {
      context.categories = await this.categoryRepo.find({ take: 10 });
    }

    if (m.includes('popular') || m.includes('trending')) {
      context.trending = await this.orderItemRepo
        .createQueryBuilder('oi')
        .leftJoin('oi.product', 'product')
        .select('product.id', 'id')
        .addSelect('product.name', 'name')
        .addSelect('SUM(oi.quantity)', 'sold')
        .groupBy('product.id')
        .addGroupBy('product.name')
        .orderBy('sold', 'DESC')
        .limit(10)
        .getRawMany();
    }

    if (m.includes('review') || m.includes('feedback')) {
      context.reviews = await this.reviewRepo.find({
        relations: ['product', 'user'],
        take: 10,
        order: { id: 'DESC' },
      });
    }

    return context;
  }

  private resolveIntent(m: string) {
    if (m.includes('cheap') || m.includes('low price')) return 'cheap';
    if (m.includes('premium') || m.includes('expensive')) return 'premium';
    if (m.includes('latest') || m.includes('recent')) return 'latest';
    if (m.includes('top') || m.includes('best') || m.includes('rating'))
      return 'top';
    if (
      m.includes('show') ||
      m.includes('list') ||
      m.includes('books') ||
      m.includes('products')
    )
      return 'list';

    return 'search';
  }
}
