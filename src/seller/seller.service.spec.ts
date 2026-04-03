import { Test, TestingModule } from '@nestjs/testing';
import { SellerService } from './seller.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Seller } from '../common/entities/seller.entity';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('SellerService', () => {
  let service: SellerService;
  let sellerRepo: jest.Mocked<Repository<Seller>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        {
          provide: getRepositoryToken(Seller),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
    sellerRepo = module.get(getRepositoryToken(Seller));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('becomeSeller', () => {
    const user = { id: 'u1', role: 'user' } as any;
    const dto = { store_name: 'My Store' } as any;

    it('should throw if user is already a seller', async () => {
      sellerRepo.findOne.mockResolvedValue({ id: 's1' } as any);

      await expect(service.becomeSeller(user, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw if store_name is missing', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.becomeSeller(user, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should create a new seller and update user role', async () => {
      sellerRepo.findOne.mockResolvedValue(null);
      const createdSeller = { id: 's1', user } as any;
      sellerRepo.create.mockReturnValue(createdSeller);
      sellerRepo.save.mockResolvedValue(createdSeller);
      userRepo.save.mockResolvedValue({ ...user, role: 'seller' });

      const result = await service.becomeSeller(user, dto);

      expect(sellerRepo.create).toHaveBeenCalledWith({ ...dto, user });
      expect(sellerRepo.save).toHaveBeenCalledWith(createdSeller);
      expect(userRepo.save).toHaveBeenCalledWith({ ...user, role: 'seller' });
      expect(result).toEqual(createdSeller);
    });
  });

  describe('updateSeller', () => {
    const user = { id: 'u1' } as any;
    const dto = { store_name: 'Updated Store' } as any;

    it('should throw if seller not found', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.updateSeller(user, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if trying to update another user\'s store', async () => {
      sellerRepo.findOne.mockResolvedValue({ user: { id: 'u2' } } as any);

      await expect(service.updateSeller(user, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should update seller successfully', async () => {
      const seller = { user, store_name: 'Old Store' } as any;
      sellerRepo.findOne.mockResolvedValue(seller);
      sellerRepo.save.mockResolvedValue({ ...seller, store_name: 'Updated Store' });

      const result = await service.updateSeller(user, dto);

      expect(sellerRepo.save).toHaveBeenCalled();
      expect(result.store_name).toBe('Updated Store');
    });
  });

  describe('findOneByUser', () => {
    it('should throw if seller not found', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneByUser('u1')).rejects.toThrow(NotFoundException);
    });

    it('should return seller if found', async () => {
      const seller = { id: 's1' } as any;
      sellerRepo.findOne.mockResolvedValue(seller);

      const result = await service.findOneByUser('u1');

      expect(result).toEqual(seller);
    });
  });

  describe('findAll', () => {
    it('should return all sellers', async () => {
      const sellers = [{ id: 's1' }, { id: 's2' }] as any;
      sellerRepo.find.mockResolvedValue(sellers);

      const result = await service.findAll();

      expect(result).toEqual(sellers);
    });
  });

  describe('findOne', () => {
    it('should throw if seller not found', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('s1')).rejects.toThrow(NotFoundException);
    });

    it('should return seller if found', async () => {
      const seller = { id: 's1' } as any;
      sellerRepo.findOne.mockResolvedValue(seller);

      const result = await service.findOne('s1');

      expect(result).toEqual(seller);
    });
  });

  describe('updateSellerByAdmin', () => {
    it('should throw if seller not found', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.updateSellerByAdmin('s1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should update seller', async () => {
      const seller = { store_name: 'Old Store' } as any;
      sellerRepo.findOne.mockResolvedValue(seller);
      sellerRepo.save.mockResolvedValue({ ...seller, store_name: 'New Store' });

      const result = await service.updateSellerByAdmin('s1', { store_name: 'New Store' });

      expect(sellerRepo.save).toHaveBeenCalled();
      expect(result.store_name).toBe('New Store');
    });
  });

  describe('removeByAdmin', () => {
    it('should throw if seller not found', async () => {
      sellerRepo.findOne.mockResolvedValue(null);

      await expect(service.removeByAdmin('s1')).rejects.toThrow(NotFoundException);
    });

    it('should remove seller', async () => {
      const seller = { id: 's1' } as any;
      sellerRepo.findOne.mockResolvedValue(seller);
      sellerRepo.remove.mockResolvedValue({ ...seller });

      const result = await service.removeByAdmin('s1');

      expect(sellerRepo.remove).toHaveBeenCalledWith(seller);
      expect(result).toEqual(seller);
    });
  });
});