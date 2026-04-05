import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { BadRequestException } from '@nestjs/common';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let service: jest.Mocked<FileUploadService>;

  const mockFileUploadService = () => ({
    uploadFile: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useFactory: mockFileUploadService,
        },
      ],
    })
        // Override guards (VERY IMPORTANT)
        .overrideGuard(require('../auth/guard/jwt-auth.guard').JwtAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })

        .overrideGuard(require('../auth/guard/role-guard.guard').RoleGuard)
        .useValue({ canActivate: jest.fn(() => true) })

        .compile();

    controller = module.get<FileUploadController>(FileUploadController);
    service = module.get(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file: any = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1234,
      };

      const dto = { description: 'test file' };
      const user = { id: 'user-1' };

      const result = { id: 'file-1' };

      service.uploadFile.mockResolvedValue(result as any);

      const response = await controller.uploadFile(file, dto as any, user as any);

      expect(service.uploadFile).toHaveBeenCalledWith(
          file,
          dto.description,
          user,
      );

      expect(response).toEqual(result);
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
          controller.uploadFile(undefined as any, {} as any, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const files = [{ id: '1' }, { id: '2' }];

      service.findAll.mockResolvedValue(files as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(files);
    });
  });

  describe('remove', () => {
    it('should delete file and return message', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(
          '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(service.remove).toHaveBeenCalledWith(
          '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(result).toEqual({
        message: 'File deleted successfully', // fix typo here
      });
    });
  });
});