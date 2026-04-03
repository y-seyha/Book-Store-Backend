import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';

describe('SellerController', () => {
  let controller: SellerController;
  let service: jest.Mocked<SellerService>;

  const mockSellerService = () => ({
    becomeSeller: jest.fn(),
    findOneByUser: jest.fn(),
    updateSeller: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateSellerByAdmin: jest.fn(),
    removeByAdmin: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [
        { provide: SellerService, useFactory: mockSellerService },
      ],
    })
        // Override guards
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RoleGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller = module.get<SellerController>(SellerController);
    service = module.get(SellerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: 'u1', role: 'user' } as any;
  const mockAdmin = { id: 'a1', role: 'admin' } as any;

  it('should call becomeSeller', async () => {
    const dto = { store_name: 'My Store' } as any;
    const result = { id: 's1', user: mockUser } as any;
    service.becomeSeller.mockResolvedValue(result);

    const res = await controller.becomeSeller({ user: mockUser }, dto);

    expect(service.becomeSeller).toHaveBeenCalledWith(mockUser, dto);
    expect(res).toEqual(result);
  });

  it('should call getMyStore', async () => {
    const result = { id: 's1', user: mockUser } as any;
    service.findOneByUser.mockResolvedValue(result);

    const res = await controller.getMyStore({ user: mockUser });

    expect(service.findOneByUser).toHaveBeenCalledWith(mockUser.id);
    expect(res).toEqual(result);
  });

  it('should call updateMyStore', async () => {
    const dto = { store_name: 'Updated Store' } as any;
    const result = { id: 's1', user: mockUser, store_name: 'Updated Store' } as any;
    service.updateSeller.mockResolvedValue(result);

    const res = await controller.updateMyStore({ user: mockUser }, dto);

    expect(service.updateSeller).toHaveBeenCalledWith(mockUser, dto);
    expect(res).toEqual(result);
  });

  it('should call getAllSellers', async () => {
    const result = [{ id: 's1' }, { id: 's2' }] as any;
    service.findAll.mockResolvedValue(result);

    const res = await controller.getAllSellers();

    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual(result);
  });

  it('should call getSellerById', async () => {
    const result = { id: 's1' } as any;
    service.findOne.mockResolvedValue(result);

    const res = await controller.getSellerById('s1');

    expect(service.findOne).toHaveBeenCalledWith('s1');
    expect(res).toEqual(result);
  });

  it('should call updateSellerByAdmin', async () => {
    const dto = { store_name: 'Admin Updated' } as any;
    const result = { id: 's1', store_name: 'Admin Updated' } as any;
    service.updateSellerByAdmin.mockResolvedValue(result);

    const res = await controller.updateSellerByAdmin('s1', dto);

    expect(service.updateSellerByAdmin).toHaveBeenCalledWith('s1', dto);
    expect(res).toEqual(result);
  });

  it('should call deleteSeller', async () => {
    const result = { id: 's1' } as any;
    service.removeByAdmin.mockResolvedValue(result);

    const res = await controller.deleteSeller('s1');

    expect(service.removeByAdmin).toHaveBeenCalledWith('s1');
    expect(res).toEqual(result);
  });
});