import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../common/entities/review.entity';
import { Product } from '../common/entities/product.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: jest.Mocked<Repository<Review>>;
  let productRepo: jest.Mocked<Repository<Product>>;
  let cacheManager: any;

  const mockRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  });

  const mockCache = () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useFactory: mockRepo },
        { provide: getRepositoryToken(Product), useFactory: mockRepo },
        { provide: CACHE_MANAGER, useFactory: mockCache },
      ],
    }).compile();

    service = module.get(ReviewService);
    reviewRepo = module.get(getRepositoryToken(Review));
    productRepo = module.get(getRepositoryToken(Product));
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create review', async () => {
      const user = { id: 'u1' };
      const product = { id: 1 };

      const dto = { product_id: 1, rating: 5, comment: 'good' };

      productRepo.findOne.mockResolvedValue(product as any);
      reviewRepo.create.mockReturnValue({} as any);
      reviewRepo.save.mockResolvedValue({ id: 1 } as any);

      const result = await service.create(user as any, dto as any);

      expect(productRepo.findOne).toHaveBeenCalled();
      expect(reviewRepo.save).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('reviews_product_1');
      expect(result).toEqual({ id: 1 });
    });

    it('should throw if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      await expect(
          service.create({} as any, { product_id: 1 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('should return cached result', async () => {
    const cached = { data: [], meta: {} };
    cacheManager.get.mockResolvedValue(cached);

    const result = await service.findAll({});

    expect(cacheManager.get).toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('should fetch from DB and cache result', async () => {
    cacheManager.get.mockResolvedValue(null);

    reviewRepo.findAndCount.mockResolvedValue(
        [[{ id: 1 } as any], 1] as any
    );

    const result = await service.findAll({ page: 1, limit: 10 }) as any;

    expect(reviewRepo.findAndCount).toHaveBeenCalled();
    expect(cacheManager.set).toHaveBeenCalled();
    expect(result.data.length).toBe(1);
  });

  it('should return one review', async () => {
    const review = { id: 1 } as any;

    reviewRepo.findOne.mockResolvedValue(review as any);

    const result = await service.findOne(1);

    expect(result).toEqual(review);
  });

  it('should throw if review not found', async () => {
    reviewRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  describe('update', () => {
    it('should update review', async () => {
      const user = { id: 'u1' };
      const review = {
        id: 1,
        user: { id: 'u1' },
        product: { id: 1 },
      };

      reviewRepo.findOne.mockResolvedValue(review as any);
      reviewRepo.save.mockResolvedValue({ ...review, rating: 4 } as any);

      const result = await service.update(user as any, 1, { rating: 4 });

      expect(cacheManager.del).toHaveBeenCalledWith('reviews_product_1');
      expect(result.rating).toBe(4);
    });

    it('should throw if review not found', async () => {
      reviewRepo.findOne.mockResolvedValue(null);

      await expect(
          service.update({ id: 'u1' } as any, 1, {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if not owner', async () => {
      reviewRepo.findOne.mockResolvedValue({
        user: { id: 'u2' },
      } as any);

      await expect(
          service.update({ id: 'u1' } as any, 1, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete review', async () => {
      const user = { id: 'u1' };

      const review = {
        id: 1,
        user: { id: 'u1' },
        product: { id: 1 },
      };

      reviewRepo.findOne.mockResolvedValue(review as any);
      reviewRepo.remove.mockResolvedValue(review as any);

      const result = await service.remove(user as any, 1);

      expect(cacheManager.del).toHaveBeenCalledWith('reviews_product_1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should throw if review not found', async () => {
      reviewRepo.findOne.mockResolvedValue(null);

      await expect(
          service.remove({ id: 'u1' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if not owner', async () => {
      reviewRepo.findOne.mockResolvedValue({
        user: { id: 'u2' },
      } as any);

      await expect(
          service.remove({ id: 'u1' } as any, 1),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});