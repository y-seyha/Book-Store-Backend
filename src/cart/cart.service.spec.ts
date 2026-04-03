import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;

  let mockCartRepo: jest.Mocked<any>;
  let mockCartItemRepo: jest.Mocked<any>;
  let mockProductRepo: jest.Mocked<any>;
  let mockUserRepo: jest.Mocked<any>;

  beforeEach(async () => {
    mockCartRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockCartItemRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
    };

    mockProductRepo = {
      findOne: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: 'CartRepository', useValue: mockCartRepo },
        { provide: 'CartItemRepository', useValue: mockCartItemRepo },
        { provide: 'ProductRepository', useValue: mockProductRepo },
        { provide: 'UserRepository', useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getUserCart('1')).rejects.toThrow(NotFoundException);
    });

    it('should create a new cart if not exists', async () => {
      const user = { id: '1' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockCartRepo.findOne.mockResolvedValue(null);
      const newCart = { id: 1, user, items: [] };
      mockCartRepo.create.mockReturnValue(newCart);
      mockCartRepo.save.mockResolvedValue(newCart);
      mockCartRepo.findOne.mockResolvedValue(newCart);

      const result = await service.getUserCart('1');
      expect(result).toEqual({ ...newCart, items: [] });
    });
  });

  describe('addToCart', () => {
    it('should throw if product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      mockUserRepo.findOne.mockResolvedValue({ id: '1' });
      mockCartRepo.findOne.mockResolvedValue({ items: [], id: 1, user: { id: '1' } });

      await expect(service.addToCart('1', { productId: 1, quantity: 1 })).rejects.toThrow(
          NotFoundException,
      );
    });

    it('should add new item if not exists', async () => {
      const userId = '1';
      const product = { id: 1 };
      const newItem = { id: 1, product, quantity: 2, status: 'active' };

      // First call to getUserCart returns empty cart
      jest.spyOn(service, 'getUserCart')
          .mockImplementationOnce(async () => ({ id: 1, items: [], user: { id: userId } } as any))
          // Second call (after adding item) returns cart with new item
          .mockImplementationOnce(async () => ({ id: 1, items: [newItem], user: { id: userId } } as any));

      mockProductRepo.findOne.mockResolvedValue(product);
      mockCartItemRepo.create.mockReturnValue(newItem);
      mockCartItemRepo.save.mockResolvedValue(newItem);

      const result = await service.addToCart(userId, { productId: 1, quantity: 2 });

      expect(result.items.length).toBe(1);
      expect(result.items[0].quantity).toBe(2);
    });

    it('should update quantity if item already exists', async () => {
      const userId = '1';
      const product = { id: 1 };
      const cartItem = { id: 1, product, quantity: 1, status: 'active' };
      const cart = { id: 1, items: [cartItem], user: { id: userId } };

      mockUserRepo.findOne.mockResolvedValue({ id: userId });
      mockCartRepo.findOne.mockResolvedValue(cart);
      mockProductRepo.findOne.mockResolvedValue(product);
      mockCartItemRepo.save.mockResolvedValue({ ...cartItem, quantity: 3 });

      const result = await service.addToCart(userId, { productId: 1, quantity: 2 });
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('updateCartItem', () => {
    it('should throw if cart item not found', async () => {
      const userId = '1';
      mockCartRepo.findOne.mockResolvedValue({ items: [], user: { id: userId } });
      mockUserRepo.findOne.mockResolvedValue({ id: userId });

      await expect(service.updateCartItem(userId, 1, { quantity: 2 })).rejects.toThrow(
          NotFoundException,
      );
    });

    it('should update item quantity', async () => {
      const userId = '1';
      const cartItem = { id: 1, product: { id: 1 }, quantity: 1, status: 'active' };
      const cart = { id: 1, items: [cartItem], user: { id: userId } };

      // mock getUserCart to return a cart with the active item
      jest.spyOn(service, 'getUserCart').mockResolvedValue(cart as any);
      mockCartItemRepo.save.mockImplementation(async item => item);

      const result = await service.updateCartItem(userId, 1, { quantity: 3 });
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    it('should throw if cart item not found', async () => {
      const userId = '1';
      mockCartRepo.findOne.mockResolvedValue({ items: [], user: { id: userId } });
      mockUserRepo.findOne.mockResolvedValue({ id: userId });

      await expect(service.removeFromCart(userId, 1)).rejects.toThrow(NotFoundException);
    });

    it('should remove item successfully', async () => {
      const userId = '1';
      const cartItem = { id: 1, status: 'active' };
      const cart = { id: 1, items: [cartItem], user: { id: userId } };
      mockUserRepo.findOne.mockResolvedValue({ id: userId });
      mockCartRepo.findOne.mockResolvedValue(cart);
      mockCartItemRepo.remove.mockResolvedValue(cartItem);

      const result = await service.removeFromCart(userId, 1);
      expect(result.message).toBe('Item removed from cart successfully');
    });
  });

  describe('clearCart', () => {
    it('should return message if cart already empty', async () => {
      const userId = '1';
      mockUserRepo.findOne.mockResolvedValue({ id: userId });
      mockCartRepo.findOne.mockResolvedValue({ items: [], user: { id: userId } });

      const result = await service.clearCart(userId);
      expect(result.message).toBe('Cart is already empty');
    });

    it('should delete active items and return message', async () => {
      const userId = '1';
      const cartItem = { id: 1, status: 'active' };
      const cart = { items: [cartItem], user: { id: userId } };
      mockUserRepo.findOne.mockResolvedValue({ id: userId });
      mockCartRepo.findOne.mockResolvedValue(cart);
      mockCartItemRepo.delete.mockResolvedValue({});

      const result = await service.clearCart(userId);
      expect(result.message).toBe('Cart cleared successfully');
    });
  });
});