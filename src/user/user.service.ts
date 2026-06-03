import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';
import { Account } from '../common/entities/account.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { File } from '../common/entities/file-upload.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    private readonly fileUploadService: FileUploadService,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(queryDto: QueryUserDto) {
    const { search, role, is_verified } = queryDto;

    const where: any = {};

    if (search) where.email = ILike(`%${search}%`);

    if (role) where.role = role;

    if (is_verified !== undefined) where.is_verified = is_verified;

    return this.userRepo.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['accounts', 'carts'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    // only allow safe fields
    const { first_name, last_name, phone, avatar_url } = dto;

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    return this.userRepo.save(user);
  }

  async changeRole(id: string, role: User['role']) {
    const user = await this.findOne(id);

    user.role = role;

    return this.userRepo.save(user);
  }

  async verifyUser(id: string) {
    const user = await this.findOne(id);

    user.is_verified = true;

    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.userRepo.remove(user);

    return { message: 'User deleted successfully' };
  }
  async create(createUserDto: CreateUserDto) {
    const { email, password, role, ...rest } = createUserDto;

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email,
        role,
        is_verified: true,
        ...rest,
      });

      const savedUser = await manager.save(user);

      const account = manager.create(Account, {
        user: savedUser,
        provider: 'credentials',
        provider_account_id: email,
        password_hash: hashedPassword,
      });

      await manager.save(account);

      return savedUser;
    });
  }

  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
    currentUser: any,
  ) {
    const user = await this.findOne(userId);

    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      throw new Error('Unauthorized');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.dataSource.transaction(async (manager) => {
      const uploaded = await this.fileUploadService.uploadFile(
        file,
        'user-avatar',
        currentUser,
      );

      const fileEntity = manager.create(File, {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploaded.url,
        publicId: uploaded.publicId,
        uploader: user,
        description: 'avatar',
      });

      await manager.save(fileEntity);

      user.avatar_url = uploaded.url;

      await manager.save(user);

      return {
        message: 'Avatar updated successfully',
        avatar_url: user.avatar_url,
      };
    });
  }
}
