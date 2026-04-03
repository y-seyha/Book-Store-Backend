import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import {CheckoutService} from "./checkout.service";
import {CheckoutDto} from "./dto/checkout.dto";
import {PaymentMethod} from "../common/entities/payment.entity";

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let checkoutService : CheckoutService;

  const mockCheckoutService = {
    checkout : jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {provide : CheckoutService, useValue : mockCheckoutService}
      ]
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    checkoutService = module.get<CheckoutService>(CheckoutService);
  });

  const dto: CheckoutDto = {
    shipping_name: 'John Doe',
    shipping_phone: '123456789',
    shipping_address: '123 Street',
    shipping_city: 'City',
    payment_method: PaymentMethod.ABA,
  };

  const mockReq = {
    user: { id: 'user-1' },
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkout', () => {
    it('should call checkoutService.checkout with userId and DTO', async () => {
      const mockResult = {order : {}, payment : {}}
      mockCheckoutService.checkout.mockResolvedValue(mockResult);

      const result  = await  controller.checkout(mockReq as any, dto)

      expect(mockCheckoutService.checkout).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(mockResult);
    })

    it('should throw if checkoutService throws', async () => {
      mockCheckoutService.checkout.mockRejectedValue(new Error('Test error'));

      await expect(controller.checkout(mockReq as any, dto)).rejects.toThrow('Test error');
    })

  })

});
