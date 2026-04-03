import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {Product} from "../common/entities/product.entity";
import {Category} from "../common/entities/category.entity";
import {User} from "../common/entities/user.entity";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {NotFoundException} from "@nestjs/common";

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepo = { findOne: jest.fn() };
  const mockUserRepo = { findOne: jest.fn() };
  const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create a new product', () => {
    it('should create a product', async () => {
      const dto = { name: 'Test', price: 100 };
      const user = { id: '1' };
      const file = { url: 'url', publicId: 'pubId' };

      mockCategoryRepo.findOne.mockResolvedValue(null);
      mockUserRepo.findOne.mockResolvedValue(user);
      mockProductRepo.create.mockReturnValue({ ...dto });
      mockProductRepo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any, '1', file as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockCache.del).toHaveBeenCalledWith('products');
      expect(mockCache.del).toHaveBeenCalledWith('product:1');
    });

    it('should throw if category not found', async () => {
      const dto = { name: 'Test', price: 100, categoryId: 1 };
      mockCategoryRepo.findOne.mockResolvedValue(null);
      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);
    });
  })

  describe('findOne', () => {
    it('should return cached product if exists', async () => {
      mockCache.get.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
      expect(mockProductRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw if product not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const product = { id: 1, name: 'Old' };
      const dto = { name: 'New' };
      mockProductRepo.findOne.mockResolvedValue(product);
      mockProductRepo.save.mockResolvedValue({ ...product, ...dto });

      const result = await service.update(1, dto as any);
      expect(result.name).toBe('New');
      expect(mockCache.del).toHaveBeenCalledWith('products');
      expect(mockCache.del).toHaveBeenCalledWith('product:1');
    });

    it('should throw if product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      const product = { id: 1 };
      mockProductRepo.findOne.mockResolvedValue(product);
      mockProductRepo.remove.mockResolvedValue(product);

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(mockCache.del).toHaveBeenCalledWith('products');
      expect(mockCache.del).toHaveBeenCalledWith('product:1');
    });

    it('should throw if product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return cached products if available', async () => {
      const query = {};
      mockCache.get.mockResolvedValue('cached');
      const result = await service.findAll(query as any);
      expect(result).toBe('cached');
    });

    it('should query database if cache missing', async () => {
      const query = { search: 'test', page: 1, limit: 10 };

      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([['product'], 1]),
      };

      mockCache.get.mockResolvedValue(null);

      mockProductRepo.createQueryBuilder.mockReturnValue(mockQb as any);

      // Call the service
      const result = await service.findAll(query as any) as {
        data: any[];
        total: number;
        page: number;
        lastPage: number;
      };

      expect(result.data).toEqual(['product']);
      expect(mockCache.set).toHaveBeenCalledWith(
          expect.any(String),
          {
            data: ['product'],
            total: 1,
            page: 1,
            lastPage: 1,
          },
          60
      );
    });
  });


});
