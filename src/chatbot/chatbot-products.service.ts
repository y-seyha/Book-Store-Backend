import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../common/entities/product.entity';
import { OrderItem } from '../common/entities/order-item.entity';

interface TopProductRaw {
  id: string;
  name: string;
  sold: string;
}

@Injectable()
export class ChatbotProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async getSimpleProducts(limit = 10) {
    return this.productRepo.find({
      take: limit,
      relations: ['category'],
      order: { id: 'DESC' },
    });
  }

  async smartSearch(keyword: string, limit = 10) {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('LOWER(product.name) LIKE LOWER(:k)', { k: `%${keyword}%` })
      .orWhere('LOWER(product.description) LIKE LOWER(:k)', {
        k: `%${keyword}%`,
      })
      .orderBy('product.id', 'DESC')
      .take(limit)
      .getMany();
  }

  async getCheapProducts(limit = 10) {
    return this.productRepo.find({
      take: limit,
      relations: ['category'],
      order: { price: 'ASC' },
    });
  }

  async getPremiumProducts(limit = 10) {
    return this.productRepo.find({
      take: limit,
      relations: ['category'],
      order: { price: 'DESC' },
    });
  }

  async getLatestProducts(limit = 10) {
    return this.productRepo.find({
      take: limit,
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async getTopProducts(limit = 10) {
    const raw = await this.orderItemRepo
      .createQueryBuilder('oi')
      .leftJoin('oi.product', 'product')
      .select([
        'product.id AS id',
        'product.name AS name',
        'SUM(oi.quantity) AS sold',
      ])
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('sold', 'DESC')
      .limit(limit)
      .getRawMany<TopProductRaw>();

    return raw.map((r) => ({
      id: Number(r.id),
      name: r.name,
      sold: Number(r.sold),
    }));
  }
}
