import {Test, TestingModule} from '@nestjs/testing';
import {CheckoutService} from './checkout.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {Order} from '../common/entities/order.entity';
import {OrderItem} from '../common/entities/order-item.entity';
import {Product} from '../common/entities/product.entity';
import {Cart} from '../common/entities/cart..entity';
import {CartItem} from '../common/entities/cart-item.entity';
import {Payment, PaymentMethod} from '../common/entities/payment.entity';
import {User} from '../common/entities/user.entity';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {CheckoutDto} from './dto/checkout.dto';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let dataSource: DataSource;


  const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const repositories = [
      Order,
      OrderItem,
      Product,
      Cart,
      CartItem,
      Payment,
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        // Dynamically create dummy repository providers
        ...repositories.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {}, // empty mock, not used directly
        })),
        // Mock DataSource with transaction
        {
          provide: DataSource,
          useValue: { transaction: jest.fn((fn) => fn(mockManager)) },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    dataSource = module.get<DataSource>(DataSource);
  });
  const user = { id: 'user-1' } as User;
  const product = { id: 'prod-1', name: 'Test Product', stock: 5, price: 10 } as unknown as Product;
  const cartItem = { id: 'ci-1', product, quantity: 2, status: 'active' } as unknown as CartItem;
  const cart = { id: 'cart-1', items: [cartItem] } as unknown as Cart;
  const dto: CheckoutDto = {
    shipping_name: 'John Doe',
    shipping_phone: '123456789',
    shipping_address: '123 Street',
    shipping_city: 'City',
    payment_method: PaymentMethod.ABA,
  };

  it('should throw NotFoundException if user not found', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);
    await expect(service.checkout('invalid-user', dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if cart not found', async () => {
    mockManager.findOne.mockResolvedValueOnce(user); // user
    mockManager.findOne.mockResolvedValueOnce(null); // cart
    await expect(service.checkout(user.id, dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if no active items', async () => {
    mockManager.findOne.mockResolvedValueOnce(user); // user
    const emptyCart = { ...cart, items: [{ ...cartItem, status: 'purchased' }] };
    mockManager.findOne.mockResolvedValueOnce(emptyCart); // cart
    await expect(service.checkout(user.id, dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if product missing', async () => {
    mockManager.findOne.mockResolvedValueOnce(user); // user
    const badCart = { ...cart, items: [{ ...cartItem, product: null }] };
    mockManager.findOne.mockResolvedValueOnce(badCart); // cart
    await expect(service.checkout(user.id, dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if not enough stock', async () => {
    mockManager.findOne.mockResolvedValueOnce(user); // user
    const lowStockCart = { ...cart, items: [{ ...cartItem, product: { ...product, stock: 1 } }] };
    mockManager.findOne.mockResolvedValueOnce(lowStockCart); // cart
    await expect(service.checkout(user.id, dto)).rejects.toThrow(BadRequestException);
  });

  it('should successfully checkout', async () => {
    mockManager.findOne.mockResolvedValueOnce(user); // user
    mockManager.findOne.mockResolvedValueOnce(cart); // cart

    mockManager.create.mockImplementation((entity, data) => data);
    mockManager.save.mockImplementation(async (entity) => entity);

    const result = await service.checkout(user.id, dto);

    expect(result.order).toBeDefined();
    expect(result.payment).toBeDefined();
    expect(result.order.total_price).toBe('20.00'); // 2 * 10
    expect(cartItem.status).toBe('purchased');
    expect(product.stock).toBe(3); // 5 - 2
  });

  it('should rollback if save fails', async () => {
    mockManager.findOne.mockResolvedValueOnce(user);
    const activeCart = {
      ...cart,
      items: [{ ...cartItem, status: 'active' }],
    };
    mockManager.findOne.mockResolvedValueOnce(activeCart);
    mockManager.create.mockImplementation((entity, data) => data);

    let callCount = 0;
    mockManager.save.mockImplementation(async (entity) => {
      callCount++;
      if (callCount === 1) throw new Error('DB save error');
      return entity;
    });

    await expect(service.checkout(user.id, dto)).rejects.toThrow('DB save error');
  });
});