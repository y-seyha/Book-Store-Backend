import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../common/entities/file-upload.entity';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { NotFoundException } from '@nestjs/common';

describe('FileUploadService', () => {
    let service: FileUploadService;
    let fileRepository: jest.Mocked<Repository<File>>;
    let cloudinaryService: jest.Mocked<CloudinaryService>;

    const mockFileRepository = () => ({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    });

    const mockCloudinaryService = () => ({
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileUploadService,
                {
                    provide: getRepositoryToken(File),
                    useFactory: mockFileRepository,
                },
                {
                    provide: CloudinaryService,
                    useFactory: mockCloudinaryService,
                },
            ],
        }).compile();

        service = module.get<FileUploadService>(FileUploadService);
        fileRepository = module.get(getRepositoryToken(File));
        cloudinaryService = module.get(CloudinaryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFile', () => {
        it('should upload file and save to database', async () => {
            const mockFile: any = {
                originalname: 'test.png',
                mimetype: 'image/png',
                size: 1234,
            };

            const mockUser = { id: 'user-1' };

            const cloudinaryResponse = {
                public_id: 'abc123',
                secure_url: 'http://image.url',
            } as any;

            const createdFile = {
                id: 'file-1',
                ...mockFile,
                ...cloudinaryResponse,
            };

            cloudinaryService.uploadFile.mockResolvedValue(cloudinaryResponse);
            fileRepository.create.mockReturnValue(createdFile as any);
            fileRepository.save.mockResolvedValue(createdFile as any);

            const result = await service.uploadFile(
                mockFile,
                'desc',
                mockUser as any,
            );

            expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
            expect(fileRepository.create).toHaveBeenCalled();
            expect(fileRepository.save).toHaveBeenCalled();
            expect(result).toEqual(createdFile);
        });
    });

    // =========================
    describe('findAll', () => {
        it('should return all files', async () => {
            const files = [{ id: '1' }, { id: '2' }];

            fileRepository.find.mockResolvedValue(files as any);

            const result = await service.findAll();

            expect(fileRepository.find).toHaveBeenCalledWith({
                relations: ['uploader'],
                order: { createdAt: 'DESC' },
            });

            expect(result).toEqual(files);
        });
    });

    describe('remove', () => {
        it('should delete file successfully', async () => {
            const file = {
                id: 'file-1',
                publicId: 'cloud-id',
            };

            fileRepository.findOne.mockResolvedValue(file as any);
            cloudinaryService.deleteFile.mockResolvedValue(undefined);
            fileRepository.remove.mockResolvedValue(file as any);

            await service.remove('file-1');

            expect(fileRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'file-1' },
            });

            expect(cloudinaryService.deleteFile).toHaveBeenCalledWith('cloud-id');
            expect(fileRepository.remove).toHaveBeenCalledWith(file);
        });

        it('should throw NotFoundException if file not found', async () => {
            fileRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('wrong-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});