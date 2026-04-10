import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Product} from "../common/entities/product.entity";
import {Repository} from "typeorm";
import {Category} from "../common/entities/category.entity";
import {User} from "../common/entities/user.entity";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import type { Cache } from 'cache-manager';
import {CreateProductDto} from "./dto/create-product.dto";
import {QueryProductDto} from "./dto/query.dto";
import {UpdateProductDto} from "./dto/update-product.dto";
import {File} from "../common/entities/file-upload.entity"
import type { Express } from 'express';


@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepo : Repository<Product>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,

        @InjectRepository(User)
        private userRepo  : Repository<User>,

        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {
    }

    async create(createDto: CreateProductDto, userId?: string,uploadFile?: File ) {
        let category: Category | null = null;
        let user: User | null = null;

        if (createDto.categoryId) {
            category = await this.categoryRepository.findOne({ where: { id: createDto.categoryId } });
            if (!category) throw new NotFoundException('Category not found');
        }

        if (userId) {
            user = await this.userRepo.findOne({ where: { id: userId } });
        }

        const product = this.productRepo.create({
            name: createDto.name,
            description: createDto.description,
            price: createDto.price,
            stock: createDto.stock ?? 0,
            category,
            user,
            image_url: uploadFile?.url ?? createDto.image_url,
            image_public_id: uploadFile?.publicId ??createDto.image_public_id,
        });

        const savedProduct = await this.productRepo.save(product);

        // Clear relevant cache keys
        await this.cacheManager.del('products'); // for list
        await this.cacheManager.del(`product:${savedProduct.id}`); // for individual item

        return savedProduct;
    }


    async findAll(query : QueryProductDto){
        const cacheKey = `products:${JSON.stringify(query)}`;
        const cached = await  this.cacheManager.get(cacheKey);
        if(cached)
            return cached;

        const qb = this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.category','category')
            .leftJoinAndSelect('product.user','user');

        if(query.search)
            qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${query.search}%` });

        if(query.categoryId)
            qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });

        //sort
        const sortBy = ['price','name','created_at'].includes(query.sortBy ?? '') ? query.sortBy: 'created_at';
        const order : 'ASC' | 'DESC' = query.order ?? 'DESC'
        qb.orderBy(`product.${sortBy}`,order)

        //pagination
        const page = query.page ?? 1;
         const limit = query.limit ?? 10;
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await  qb.getManyAndCount()
        const result = {
             data,
            total,
             page,
            lastPage : Math.ceil(total / limit),
        }
        await this.cacheManager.set(cacheKey, result,  60 );
         return result;
    }

    async getCategoryCounts() {
        const categoryCounts = await this.productRepo
            .createQueryBuilder('product')
            .leftJoin('product.category', 'category')
            .select('product.category_id', 'categoryId') // correct column
            .addSelect('category.name', 'label')
            .addSelect('COUNT(product.id)', 'count')
            .groupBy('product.category_id')
            .addGroupBy('category.name')
            .getRawMany();

        return categoryCounts.map(c => ({
            categoryId: Number(c.categoryId),
            label: c.label,
            count: Number(c.count),
        }));
    }

    async  findOne(id : number){
        const cacheKey =   `product:${id}`;
        const cached = await  this.cacheManager.get(cacheKey);
        if(cached)
            return cached;

        const product = await  this.productRepo.findOne({where:{id}, relations : ['category', 'user']});

        if(!product)
            throw new NotFoundException('Product not found');

        await this.cacheManager.set(cacheKey, product,  60 );
        return product;
    }

    async update(id : number, updateDto : UpdateProductDto){
        const product = await this.productRepo.findOne({ where: { id}, relations : ['category', 'user'] });

        if(!product)
            throw new NotFoundException('Product not found');

        //update category
        if(updateDto.categoryId){
            const category = await  this.categoryRepository.findOne({ where: { id: updateDto.categoryId } });
            if(!category)
                throw new NotFoundException('Category not found');
            product.category = category;
        }

        //update field
        if (updateDto.name !== undefined) product.name = updateDto.name;
        if (updateDto.description !== undefined) product.description = updateDto.description;
        if (updateDto.price !== undefined) product.price = updateDto.price;
        if (updateDto.stock !== undefined) product.stock = updateDto.stock;
        if (updateDto.image_url !== undefined) product.image_url = updateDto.image_url;
        if (updateDto.image_public_id !== undefined) product.image_public_id = updateDto.image_public_id;

        const updated = await this.productRepo.save(product);

        //clear caches
        await  this.cacheManager.del('products');
        await this.cacheManager.del(`product:${id}`);

        return updated;
    }

    async  remove(id : number){
        const product = await  this.productRepo.findOne({where : {id}})
        if(!product)
            throw new NotFoundException('Product not found');

        await this.productRepo.remove(product);

        await this.cacheManager.del('products');
        await this.cacheManager.del(`product:${id}`);

        return {message : 'Product deleted successfully'}
    }

    async findByCategory(categoryId: number, query?: QueryProductDto) {
        const cacheKey = `products:category:${categoryId}:${JSON.stringify(query ?? {})}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const qb = this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.user', 'user')
            .where('category.id = :categoryId', { categoryId });

        // Optional search filter
        if (query?.search) {
            qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${query.search}%` });
        }

        // Sorting
        const sortBy = ['price','name','created_at'].includes(query?.sortBy ?? '') ? query?.sortBy : 'created_at';
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

        await this.cacheManager.set(cacheKey, result, 60); // cache for 60 seconds
        return result;
    }
}
