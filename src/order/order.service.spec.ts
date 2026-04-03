import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Product } from '../common/entities/product.entity';
import { User } from '../common/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;

  let orderRepo: jest.Mocked<Repository<Order>>;
  let orderItemRepo: jest.Mocked<Repository<OrderItem>>;
  let productRepo: jest.Mocked<Repository<Product>>;
  let dataSource: jest.Mocked<DataSource>;

  //  mock manager for transaction
  const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = () => ({
    transaction: jest.fn(),
  });

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useFactory: mockRepo },
        { provide: getRepositoryToken(OrderItem), useFactory: mockRepo },
        { provide: getRepositoryToken(Product), useFactory: mockRepo },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(getRepositoryToken(Order));
    orderItemRepo = module.get(getRepositoryToken(OrderItem));
    productRepo = module.get(getRepositoryToken(Product));
    dataSource = module.get(DataSource);

    jest.clearAllMocks();
  });

  it('should create order successfully', async () => {
    const user = { id: 'user-1' };
    const product = { id: 'p1', price: '10' };

    const dto = {
      shipping_name: 'John',
      shipping_phone: '123',
      shipping_address: 'Street',
      shipping_city: 'City',
      items: [{ product_id: 'p1', quantity: 2 }],
    };

    //  mock transaction
    dataSource.transaction.mockImplementation(async (cb: any) => {
      return cb(mockManager);
    });

    mockManager.findOne
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(product as any);

    mockManager.create
        .mockReturnValueOnce({})
        .mockReturnValueOnce({});

    mockManager.save.mockResolvedValue({});

    const result = await service.createOrder('user-1', dto as any);

    expect(result).toBeDefined();
    expect(mockManager.save).toHaveBeenCalled();
  });

  it('should throw if user not found', async () => {
    dataSource.transaction.mockImplementation(async (cb: any) => {
      return cb(mockManager);
    });

    mockManager.findOne.mockResolvedValue(null);

    await expect(
        service.createOrder('wrong-user', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if product not found', async () => {
    const user = { id: 'user-1' };

    const dto = {
      items: [{ product_id: 'p1', quantity: 1 }],
    };

    dataSource.transaction.mockImplementation(async (cb: any) => {
      return cb(mockManager);
    });

    mockManager.findOne
        .mockResolvedValueOnce(user as any) // user
        .mockResolvedValueOnce(null);       // product

    await expect(
        service.createOrder('user-1', dto as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should calculate total price correctly', async () => {
    const user = { id: 'user-1' };

    const dto = {
      shipping_name: '',
      shipping_phone: '',
      shipping_address: '',
      shipping_city: '',
      items: [
        { product_id: 'p1', quantity: 2 }, // 10 * 2
        { product_id: 'p2', quantity: 1 }, // 5 * 1
      ],
    };

    const product1 = { id: 'p1', price: '10' };
    const product2 = { id: 'p2', price: '5' };

    let savedOrder: any = {};

    dataSource.transaction.mockImplementation(async (cb: any) => {
      return cb(mockManager);
    });

    mockManager.findOne
        .mockResolvedValueOnce(user as any)
        .mockResolvedValueOnce(product1 as any)
        .mockResolvedValueOnce(product2 as any);

    mockManager.create.mockImplementation((_, data) => data);

    mockManager.save.mockImplementation(async (data) => {
      if (!Array.isArray(data)) savedOrder = data;
      return data;
    });

    const result = await service.createOrder('user-1', dto as any);

    expect(result.total_price).toBe('25.00');
  });

  it('should return all orders', async () => {
    const orders = [{ id: 1 }];

    orderRepo.find.mockResolvedValue(orders as any);

    const result = await service.findAll();

    expect(orderRepo.find).toHaveBeenCalledWith({
      relations: ['user', 'items', 'items.product'],
    });

    expect(result).toEqual(orders);
  });

  it('should return user orders', async () => {
    const orders = [{ id: 1 }];

    orderRepo.find.mockResolvedValue(orders as any);

    const result = await service.findMyOrders('user-1');

    expect(orderRepo.find).toHaveBeenCalledWith({
      where: { user: { id: 'user-1' } },
      relations: ['user', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    expect(result).toEqual(orders);
  });

  it('should return order by id', async () => {
    const order = { id: 1 };

    orderRepo.findOne.mockResolvedValue(order as any);

    const result = await service.findOne(1);

    expect(result).toEqual(order);
  });

  it('should throw if order not found', async () => {
    orderRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(
        NotFoundException,
    );
  });
});