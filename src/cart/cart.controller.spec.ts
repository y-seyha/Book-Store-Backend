import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { NotFoundException } from '@nestjs/common';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockCartService = {
    getUserCart: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    clearCart: jest.fn(),
    removeFromCart: jest.fn(),
  };

  const mockUser = { id: '1', email: 'test@test.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const cart = { id: 1, items: [] };
      mockCartService.getUserCart.mockResolvedValue(cart);

      const result = await controller.getCart(mockUser);
      expect(result).toBe(cart);
      expect(mockCartService.getUserCart).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const dto: AddToCartDto = { productId: 1, quantity: 2 };
      const updatedCart = { id: 1, items: [{ productId: 1, quantity: 2 }] };
      mockCartService.addToCart.mockResolvedValue(updatedCart);

      const result = await controller.addToCart(mockUser, dto);
      expect(result).toBe(updatedCart);
      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it('should propagate errors', async () => {
      const dto: AddToCartDto = { productId: 1, quantity: 2 };
      mockCartService.addToCart.mockRejectedValue(new NotFoundException());

      await expect(controller.addToCart(mockUser, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item', async () => {
      const dto: UpdateCartItemDto = { quantity: 5 };
      const updatedCart = { id: 1, items: [{ id: 1, quantity: 5 }] };
      mockCartService.updateCartItem.mockResolvedValue(updatedCart);

      const result = await controller.updateCartItem(mockUser, 1, dto);
      expect(result).toBe(updatedCart);
      expect(mockCartService.updateCartItem).toHaveBeenCalledWith(mockUser.id, 1, dto);
    });

    it('should propagate errors', async () => {
      const dto: UpdateCartItemDto = { quantity: 5 };
      mockCartService.updateCartItem.mockRejectedValue(new NotFoundException());

      await expect(controller.updateCartItem(mockUser, 1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      const response = { message: 'Cart cleared successfully' };
      mockCartService.clearCart.mockResolvedValue(response);

      const result = await controller.clearCart(mockUser);
      expect(result).toBe(response);
      expect(mockCartService.clearCart).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const response = { message: 'Item removed from cart successfully' };
      mockCartService.removeFromCart.mockResolvedValue(response);

      const result = await controller.removeFromCart(mockUser, 1);
      expect(result).toBe(response);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(mockUser.id, 1);
    });

    it('should propagate errors', async () => {
      mockCartService.removeFromCart.mockRejectedValue(new NotFoundException());

      await expect(controller.removeFromCart(mockUser, 1)).rejects.toThrow(NotFoundException);
    });
  });
});