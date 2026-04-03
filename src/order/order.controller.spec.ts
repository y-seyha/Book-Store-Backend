import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  const mockOrderService = () => ({
    createOrder: jest.fn(),
    findMyOrders: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useFactory: mockOrderService,
        },
      ],
    })
        // Override JWT Guard (VERY IMPORTANT)
        .overrideGuard(require('../auth/guard/jwt-auth.guard').JwtAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order', async () => {
      const user = { id: 'user-1' };
      const dto = { items: [] };

      const result = { id: 1 };

      service.createOrder.mockResolvedValue(result as any);

      const response = await controller.create(user, dto as any);

      expect(service.createOrder).toHaveBeenCalledWith(
          user.id,
          dto,
      );

      expect(response).toEqual(result);
    });
  });

  describe('myOrders', () => {
    it('should return user orders', async () => {
      const user = { id: 'user-1' };
      const orders = [{ id: 1 }];

      service.findMyOrders.mockResolvedValue(orders as any);

      const result = await controller.myOrders(user);

      expect(service.findMyOrders).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(orders);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const orders = [{ id: 1 }];

      service.findAll.mockResolvedValue(orders as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('should return one order', async () => {
      const order = { id: 1 };

      service.findOne.mockResolvedValue(order as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(order);
    });
  });
});