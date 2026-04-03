import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../common/entities/review.entity';
import { User } from '../common/entities/user.entity';

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: jest.Mocked<ReviewService>;

  const mockReviewService = () => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        { provide: ReviewService, useFactory: mockReviewService },
      ],
    })
        // override JWT guard
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get(ReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call findAll with query params', async () => {
    const mockResult = { data: [], meta: {} };
    service.findAll.mockResolvedValue(mockResult as any);

    const result = await controller.findAll(1, 10, 1, 5, 'rating', 'DESC');

    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      product_id: 1,
      rating: 5,
      sort: 'rating',
      order: 'DESC',
    });

    expect(result).toEqual(mockResult);
  });

  it('should call findOne with id', async () => {
    const mockReview = { id: 1 } as any;
    service.findOne.mockResolvedValue(mockReview);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockReview);
  });

  it('should call create with user and dto', async () => {
    const user = { id: 'u1' } as any;
    const dto = { product_id: 1, rating: 5, comment: 'good' } as any;
    const mockReview = { id: 1 } as any;

    service.create.mockResolvedValue(mockReview);

    const result = await controller.create(dto, user);

    expect(service.create).toHaveBeenCalledWith(user, dto);
    expect(result).toEqual(mockReview);
  });

  it('should call update with user, id, and dto', async () => {
    const user = { id: 'u1' } as any;
    const dto = { rating: 4 } as any;
    const mockReview = { id: 1 } as any;

    service.update.mockResolvedValue(mockReview);

    const result = await controller.update(1, dto, user);

    expect(service.update).toHaveBeenCalledWith(user, 1, dto);
    expect(result).toEqual(mockReview);
  });

  it('should call remove with user and id', async () => {
    const user = { id: 'u1' } as any;
    const mockResult = { message: 'Deleted successfully' };

    service.remove.mockResolvedValue(mockResult as any);

    const result = await controller.remove(1, user);

    expect(service.remove).toHaveBeenCalledWith(user, 1);
    expect(result).toEqual(mockResult);
  });
});