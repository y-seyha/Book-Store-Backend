import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryTrackingController } from './delivery_tracking.controller';

describe('DeliveryTrackingController', () => {
  let controller: DeliveryTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryTrackingController],
    }).compile();

    controller = module.get<DeliveryTrackingController>(DeliveryTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
