import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from '../common/entities/seller.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import {
  OrderItem,
  OrderItemStatus,
} from '../common/entities/order-item.entity';
import { Payment, PaymentStatus } from '../common/entities/payment.entity';
import { Product } from '../common/entities/product.entity';
import { QueryProductDto } from '../products/dto/query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private sellerRepo: Repository<Seller>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    private dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  // Become a seller
  async becomeSeller(user: User, dto: CreateSellerDto) {
    return this.dataSource.transaction(async (manager) => {
      const sellerRepo = manager.getRepository(Seller);
      const userRepo = manager.getRepository(User);

      const existing = await sellerRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (existing) {
        throw new ForbiddenException('You are already a seller');
      }

      if (!dto.store_name) {
        throw new BadRequestException('Store name is required');
      }

      const seller = sellerRepo.create({
        ...dto,
        user,
      });

      const savedSeller = await sellerRepo.save(seller);

      // upgrade role safely
      if (user.role !== 'seller') {
        user.role = 'seller';
        await userRepo.save(user);
      }

      return savedSeller;
    });
  }

  async updateSeller(user: User, dto: UpdateSellerDto) {
    const seller = await this.getSellerByUserId(user.id);

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    Object.assign(seller, {
      store_name: dto.store_name ?? seller.store_name,
      store_description: dto.store_description ?? seller.store_description,
      store_address: dto.store_address ?? seller.store_address,
      phone: dto.phone ?? seller.phone,
      logo_url: dto.logo_url ?? seller.logo_url,
    });

    return this.sellerRepo.save(seller);
  }

  async findOneByUser(userId: string) {
    const seller = await this.getSellerByUserId(userId);

    if (!seller) throw new NotFoundException('Seller not found');

    return seller;
  }

  // Admin: Get all sellers
  async findAll() {
    return this.sellerRepo.find({ relations: ['user'] });
  }

  // Admin: Get seller by ID
  async findOne(id: string) {
    const seller = await this.sellerRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!seller) throw new NotFoundException('Seller not found');

    return seller;
  }

  async updateSellerByAdmin(id: string, dto: UpdateSellerDto) {
    const seller = await this.findOne(id);

    Object.assign(seller, {
      store_name: dto.store_name ?? seller.store_name,
      store_description: dto.store_description ?? seller.store_description,
      store_address: dto.store_address ?? seller.store_address,
      phone: dto.phone ?? seller.phone,
      logo_url: dto.logo_url ?? seller.logo_url,
    });

    return this.sellerRepo.save(seller);
  }

  async removeByAdmin(id: string) {
    const seller = await this.findOne(id);
    await this.sellerRepo.remove(seller);

    return {
      success: true,
      message: 'Seller deleted successfully',
    };
  }

  async getMyOrder(user: User) {
    const seller = await this.getSellerByUserId(user.id);

    if (!seller) throw new ForbiddenException('You are not the seller');

    return this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.order', 'order')
      .leftJoinAndSelect('item.product', 'product')
      .where('product.user_id = :sellerId', { sellerId: user.id })
      .orderBy('item.created_at', 'DESC')
      .getMany();
  }

  async updateOrderItemStatus(
    user: User,
    itemId: number,
    status: OrderItemStatus,
  ) {
    const item = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .where('item.id = :itemId', { itemId })
      .getOne();

    if (!item) throw new NotFoundException('Order item not found');

    // ensure seller owns this product
    if (item.product?.user_id !== user.id) {
      throw new ForbiddenException('You cannot update this item');
    }

    item.status = status;

    return this.orderItemRepo.save(item);
  }

  async getSellerDashboard(user: User) {
    await this.validateSeller(user.id);

    const [
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      topProducts,
      lowStockProducts,
      recentOrders,
      bestSellingCategory,
      unsoldProducts,
      monthlyRevenue,
      paymentStatusStats,
      paymentMethodStats,
    ] = await Promise.all([
      this.getSellerTotalSales(user.id),
      this.getSellerTotalOrders(user.id),
      this.getSellerTotalProducts(user.id),
      this.getSellerTotalCustomers(user.id),
      this.getSellerTopProducts(user.id),
      this.getLowStockProducts(user.id),
      this.getRecentOrders(user.id),
      this.getBestSellingCategory(user.id),
      this.getUnsoldProducts(user.id),
      this.getMonthlyRevenue(user.id),
      this.getPaymentStatusStats(user.id),
      this.getPaymentMethodStats(user.id),
    ]);

    return {
      summary: {
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
        averageOrderValue:
          totalOrders > 0 ? Number((totalSales / totalOrders).toFixed(2)) : 0,
      },

      topProducts,

      bestSellingCategory,

      inventory: {
        lowStockProducts,
        lowStockCount: lowStockProducts.length,

        unsoldProducts,
        unsoldCount: unsoldProducts.length,
      },

      sales: {
        monthlyRevenue,
        paymentStatusStats,
        paymentMethodStats,
      },

      recentOrders,
    };
  }

  async findBySeller(userId: string, query?: QueryProductDto) {
    const cacheKey = `products:seller:${userId}:${JSON.stringify(query ?? {})}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.user', 'user')
      .where('user.id = :userId', { userId });

    // Search
    if (query?.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    // Sorting
    const sortBy = ['price', 'name', 'created_at'].includes(query?.sortBy ?? '')
      ? query?.sortBy
      : 'created_at';

    const order: 'ASC' | 'DESC' = query?.order ?? 'DESC';
    qb.orderBy(`product.${sortBy}`, order);

    // Pagination
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const result = {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };

    await this.cacheManager.set(cacheKey, result, 60);

    return result;
  }

  private async getSellerByUserId(userId: string) {
    return this.sellerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
  private async getSellerTotalSales(userId: string): Promise<number> {
    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('COALESCE(SUM(item.price * item.quantity), 0)', 'total')
      .where('payment.status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  private async getSellerTotalOrders(userId: string): Promise<number> {
    const result = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .select('COUNT(DISTINCT item.order_id)', 'count')
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }

  private async getSellerTopProducts(userId: string) {
    return this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'totalSold')
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getSellerTotalProducts(userId: string): Promise<number> {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();
  }

  //validation
  private async validateSeller(userId: string): Promise<Seller> {
    const seller = await this.getSellerByUserId(userId);

    if (!seller) {
      throw new ForbiddenException('You are not a seller');
    }

    return seller;
  }

  private async getSellerTotalCustomers(userId: string): Promise<number> {
    const result = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select('COUNT(DISTINCT order.user_id)', 'count')
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }

  private async getLowStockProducts(userId: string) {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('product.stock <= :stock', { stock: 5 })
      .orderBy('product.stock', 'ASC')
      .take(10)
      .getMany();
  }

  private async getRecentOrders(userId: string) {
    return this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.order', 'order')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .orderBy('item.created_at', 'DESC')
      .take(10)
      .getMany();
  }

  private async getBestSellingCategory(userId: string) {
    return this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .leftJoin('product.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(1)
      .getRawOne<{
        categoryId: number;
        categoryName: string;
        totalSold: string;
      }>();
  }

  private async getUnsoldProducts(userId: string) {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .leftJoin(OrderItem, 'item', 'item.product_id = product.id')
      .where('user.id = :userId', { userId })
      .andWhere('item.id IS NULL')
      .getMany();
  }

  private async getMonthlyRevenue(userId: string) {
    return this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')

      .select("TO_CHAR(payment.paid_at, 'YYYY-MM')", 'month')
      .addSelect('SUM(item.price::numeric * item.quantity)', 'revenue')

      .where('payment.status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      .andWhere('payment.paid_at IS NOT NULL')

      .andWhere('product.user_id = :userId', { userId })

      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  private async getPaymentStatusStats(userId: string) {
    return this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')

      .select('payment.status', 'status')
      .addSelect('COUNT(DISTINCT payment.id)', 'count')

      .where('product.user_id = :userId', { userId })

      .groupBy('payment.status')
      .getRawMany();
  }

  private async getPaymentMethodStats(userId: string) {
    return this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')

      .select('payment.method', 'method')
      .addSelect('COUNT(DISTINCT payment.id)', 'count')

      .where('product.user_id = :userId', { userId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.SUCCESS,
      })

      .groupBy('payment.method')
      .getRawMany();
  }
}
