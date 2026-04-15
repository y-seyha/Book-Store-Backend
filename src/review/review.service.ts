import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsOrder } from "typeorm";
import { Review } from "../common/entities/review.entity";
import { Product } from "../common/entities/product.entity";
import { User } from "../common/entities/user.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import type{ Cache } from 'cache-manager';
import {CACHE_MANAGER} from "@nestjs/cache-manager";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,

        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    // CREATE
    async create(user: User, createReviewDto: CreateReviewDto) {
        const product = await this.productRepo.findOne({ where: { id: createReviewDto.product_id } });
        if (!product) throw new NotFoundException('Product not found');

        const review = this.reviewRepo.create({
            user,
            product,
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
        });

        const saved = await this.reviewRepo.save(review);
        await this.cacheManager.del(`reviews_product_${product.id}`); // invalidate cache
        return saved;
    }

    // READ ALL with Pagination, Filter, Sort
    async findAll(query: {
        page?: number;
        limit?: number;
        product_id?: number;
        rating?: number;
        sort?: 'rating' | 'created_at';
        order?: 'ASC' | 'DESC';
    }) {
        const { page = 1, limit = 10, product_id, rating, sort = 'created_at', order = 'DESC' } = query;

        const cacheKey = `reviews_${product_id || 'all'}_${rating || 'all'}_${page}_${limit}_${sort}_${order}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const where: any = {};
        if (product_id) where.product = { id: product_id };
        if (rating) where.rating = rating;

        const [data, total] = await this.reviewRepo.findAndCount({
            where,
            relations: ['user', 'product'],
            order: { [sort]: order } as FindOptionsOrder<Review>,
            skip: (page - 1) * limit,
            take: limit,
        });

        const result = {
            data,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };

        await this.cacheManager.set(cacheKey, result,  60 ); // cache for 60 seconds
        return result;
    }

    // READ ONE
    async findOne(id: number) {
        const review = await this.reviewRepo.findOne({ where: { id }, relations: ['user', 'product'] });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    // UPDATE
    async update(user: User, id: number, updateReviewDto: UpdateReviewDto) {
        const review = await this.reviewRepo.findOne({ where: { id }, relations: ['user', 'product'] });
        if (!review) throw new NotFoundException('Review not found');
        if (review.user.id !== user.id) throw new ForbiddenException("Cannot edit others' reviews");

        Object.assign(review, updateReviewDto);
        const updated = await this.reviewRepo.save(review);
        await this.cacheManager.del(`reviews_product_${review.product.id}`); // invalidate cache
        return updated;
    }

    // DELETE
    async remove(user: User, id: number) {
        const review = await this.reviewRepo.findOne({ where: { id }, relations: ['user', 'product'] });
        if (!review) throw new NotFoundException('Review not found');
        if (review.user.id !== user.id) throw new ForbiddenException("Cannot delete others' reviews");

        const deleted = await this.reviewRepo.remove(review);
        await this.cacheManager.del(`reviews_product_${review.product.id}`); // invalidate cache
        return {message :"Deleted successfully"};
    }

    //admin endpoint
    async adminFindAll(query: {
        page?: number;
        limit?: number;
        product_id?: number;
        rating?: number;
        search?: string;
    }) {
        const { page = 1, limit = 10, product_id, rating, search } = query;

        const qb = this.reviewRepo.createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.product', 'product')
            .orderBy('review.created_at', 'DESC');

        if (product_id) {
            qb.andWhere('product.id = :product_id', { product_id });
        }

        if (rating) {
            qb.andWhere('review.rating = :rating', { rating });
        }

        if (search) {
            qb.andWhere(
                '(user.email ILIKE :search OR review.comment ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async adminFindOne(id: number) {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: ['user', 'product'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    async adminRemove(id: number) {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: ['product'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        await this.reviewRepo.remove(review);

        await this.cacheManager.del(`reviews_product_${review.product?.id || 'all'}`);

        return { message: 'Review deleted successfully' };
    }

    async adminUpdate(id: number, dto: UpdateReviewDto) {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: ['product'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        Object.assign(review, dto);

        const updated = await this.reviewRepo.save(review);

        await this.cacheManager.del(`reviews_product_${review.product?.id || 'all'}`);

        return updated;
    }

}