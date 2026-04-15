import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Seller} from "../common/entities/seller.entity";
import {DataSource, Repository} from "typeorm";
import {User} from "../common/entities/user.entity";
import {CreateSellerDto} from "./dto/create-seller.dto";
import {UpdateSellerDto} from "./dto/update-seller.dto";
import {OrderItem, OrderItemStatus} from "../common/entities/order-item.entity";
import {Payment, PaymentStatus} from "../common/entities/payment.entity";
import {Product} from "../common/entities/product.entity";

@Injectable()
export class SellerService {
    constructor(
        @InjectRepository(Seller)
        private sellerRepo: Repository<Seller>,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(OrderItem)
        private orderItemRepo: Repository<OrderItem>,

        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,

        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        private dataSource: DataSource,
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

        if (!seller)
            throw new NotFoundException('Seller not found');

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

        if (!seller)
            throw new NotFoundException('Seller not found');

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
            message: "Seller deleted successfully",
        };
    }

    async getMyOrder(user : User){
        const seller = await  this.getSellerByUserId(user.id);

        if(!seller)
            throw new ForbiddenException('You are not the seller');

        return this.orderItemRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.order','order')
            .leftJoinAndSelect('item.product','product')
            .where('product.user_id = :sellerId', {sellerId: user.id})
            .orderBy( 'item.created_at', 'DESC')
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

        if (!item)
            throw new NotFoundException('Order item not found');


        // ensure seller owns this product
        if (item.product?.user_id !== user.id) {
            throw new ForbiddenException('You cannot update this item');
        }

        item.status = status;

        return this.orderItemRepo.save(item);
    }



    async getSellerDashboard(user: User) {
        const seller = await this.getSellerByUserId(user.id);

        if (!seller) {
            throw new ForbiddenException('You are not a seller');
        }

        const [
            totalSales,
            totalOrders,
            topProducts,
        ] = await Promise.all([
            this.getSellerTotalSales(user.id),
            this.getSellerTotalOrders(user.id),
            this.getSellerTopProducts(user.id),
        ]);

        return {
            totalSales,
            totalOrders,
            topProducts,
        };
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
            .andWhere('product.user_id = :userId', { userId })
            .getRawOne();

        return Number(result.total);
    }

    private async getSellerTotalOrders(userId: string): Promise<number> {
        const result = await this.orderItemRepo
            .createQueryBuilder('item')
            .leftJoin('item.product', 'product')
            .select('COUNT(DISTINCT item.order_id)', 'count')
            .where('product.user_id = :userId', { userId })
            .getRawOne();

        return Number(result.count);
    }

    private async getSellerTopProducts(userId: string) {
        return this.orderItemRepo
            .createQueryBuilder('item')
            .leftJoin('item.product', 'product')
            .select('product.id', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('COALESCE(SUM(item.quantity), 0)', 'totalSold')
            .where('product.user_id = :userId', { userId })
            .groupBy('product.id')
            .addGroupBy('product.name')
            .orderBy('SUM(item.quantity)', 'DESC')
            .limit(5)
            .getRawMany();
    }

}
