import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriverService } from './delivery_driver.service';

describe('DeliveryDriverService', () => {
  let service: DeliveryDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryDriverService],
    }).compile();

    service = module.get<DeliveryDriverService>(DeliveryDriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
