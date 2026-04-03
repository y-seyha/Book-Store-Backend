import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import {ProductsService} from "./products.service";
import {FileUploadService} from "../file-upload/file-upload.service";
import {QueryProductDto} from "./dto/query.dto";
import {NotFoundException} from "@nestjs/common";
import {UpdateProductDto} from "./dto/update-product.dto";
import {CreateProductDto} from "./dto/create-product.dto";

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;
  let fileUploadService: FileUploadService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileUploadService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: FileUploadService, useValue: mockFileUploadService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const query: QueryProductDto = { search: 'test', page: 1, limit: 10 };
      const serviceResponse = { data: ['product'], total: 1, page: 1, lastPage: 1 };
      mockProductsService.findAll.mockResolvedValue(serviceResponse);

      const result = await controller.findAll(query);
      expect(result).toBe(serviceResponse);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should propagate errors from service', async () => {
      const query: QueryProductDto = {};
      mockProductsService.findAll.mockRejectedValue(new Error('Service error'));
      await expect(controller.findAll(query)).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const product = { id: 1, name: 'Product 1' };
      mockProductsService.findOne.mockResolvedValue(product);
      const result = await controller.findOne(1);
      expect(result).toBe(product);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate not found error', async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto: CreateProductDto = { name: 'New Product', description: 'Desc', price: 10, stock: 5 };

    it('should create a product without file', async () => {
      const user = { id: 'user1' };
      const product = { id: 1, ...dto };
      mockProductsService.create.mockResolvedValue(product);

      const result = await controller.create(undefined as any, dto, user as any);
      expect(result).toBe(product);
      expect(mockProductsService.create).toHaveBeenCalledWith(dto, user.id, undefined);
    });

    it('should create a product with file', async () => {
      const file = { originalname: 'file.jpg', buffer: Buffer.from('') } as Express.Multer.File;
      const user = { id: 'user1' };
      const uploadedFile = { url: 'url', publicId: 'id' };
      const product = { id: 1, ...dto, image_url: 'url' };

      mockFileUploadService.uploadFile.mockResolvedValue(uploadedFile);
      mockProductsService.create.mockResolvedValue(product);

      const result = await controller.create(file, dto, user as any);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(file, dto.description, user);
      expect(mockProductsService.create).toHaveBeenCalledWith(dto, user.id, uploadedFile);
      expect(result).toBe(product);
    });

    it('should propagate errors from service', async () => {
      const user = { id: 'user1' };
      mockProductsService.create.mockRejectedValue(new Error('Create error'));
      await expect(controller.create(undefined as any, dto, user as any)).rejects.toThrow('Create error');
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated' };

    it('should update a product', async () => {
      const product = { id: 1, name: 'Updated' };
      mockProductsService.update.mockResolvedValue(product);

      const result = await controller.update(1, updateDto);
      expect(result).toBe(product);
      expect(mockProductsService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should propagate errors from service', async () => {
      mockProductsService.update.mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const response = { message: 'Deleted' };
      mockProductsService.remove.mockResolvedValue(response);

      const result = await controller.remove(1);
      expect(result).toBe(response);
      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate errors from service', async () => {
      mockProductsService.remove.mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

});
