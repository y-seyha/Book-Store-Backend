import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriverController } from './delivery_driver.controller';

describe('DeliveryDriverController', () => {
  let controller: DeliveryDriverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryDriverController],
    }).compile();

    controller = module.get<DeliveryDriverController>(DeliveryDriverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
