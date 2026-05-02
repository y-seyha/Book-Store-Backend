import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import {UpdateProfileDto} from "./dto/updateProfile.dto";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async updateMyProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (dto.first_name !== undefined) {
            user.first_name = dto.first_name.trim();
        }

        if (dto.last_name !== undefined) {
            user.last_name = dto.last_name.trim();
        }

        if (dto.phone !== undefined) {
            user.phone = dto.phone;
        }

        if (dto.avatar_url !== undefined) {
            user.avatar_url = dto.avatar_url;
        }

        return this.userRepo.save(user);
    }
}