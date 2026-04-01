import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Seller} from "../common/entities/seller.entity";
import {Repository} from "typeorm";
import {User} from "../common/entities/user.entity";
import {CreateSellerDto} from "./dto/create-seller.dto";
import {UpdateSellerDto} from "./dto/update-seller.dto";

@Injectable()
export class SellerService {
    constructor(
        @InjectRepository(Seller)
        private sellerRepo: Repository<Seller>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    // Become a seller
    async becomeSeller(user: User, createSellerDto: CreateSellerDto) {
        // Check if user already has a seller record
        const existingSeller = await this.sellerRepo.findOne({
            where: { user: { id: user.id } },
        });
        if (existingSeller) {
            throw new ForbiddenException('You are already a seller');
        }

        // Validate required field
        if (!createSellerDto.store_name) {
            throw new BadRequestException('Store name is required to become a seller');
        }

        // Create new seller
        const seller = this.sellerRepo.create({
            ...createSellerDto,
            user,
        });
        const savedSeller = await this.sellerRepo.save(seller);

        // Update user role to seller if not already
        if (user.role !== 'seller') {
            user.role = 'seller';
            await this.userRepo.save(user);
        }

        return savedSeller;
    }

    async  updateSeller(user: User, updateSellerDto: UpdateSellerDto) {
        const seller = await this.sellerRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['user'],
        });

        if(!seller)
            throw new NotFoundException('Seller not found');

        if(seller.user.id !== user.id)
            throw new ForbiddenException("You cannot update another user's store");

        Object.assign(seller, updateSellerDto);

        return this.sellerRepo.save(seller);
    }

    async findOneByUser(userId: string) {
        const seller = await this.sellerRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!seller) throw new NotFoundException('Seller not found');
        return seller;
    }

    // Admin: Get all sellers
    async findAll() {
        return this.sellerRepo.find({ relations: ['user'] });
    }

    // Admin: Get seller by ID
    async findOne(id: string) {
        const seller = await this.sellerRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!seller) throw new NotFoundException('Seller not found');
        return seller;
    }

    async updateSellerByAdmin(id: string, updateSellerDto: UpdateSellerDto) {
        const seller = await this.sellerRepo.findOne({ where: { id }, relations: ['user'] });
        if (!seller) throw new NotFoundException('Seller not found');

        Object.assign(seller, updateSellerDto);
        return this.sellerRepo.save(seller);
    }

    // Admin: Delete seller by ID
    async removeByAdmin(id: string) {
        const seller = await this.sellerRepo.findOne({ where: { id }, relations: ['user'] });
        if (!seller) throw new NotFoundException('Seller not found');

        return this.sellerRepo.remove(seller);
    }

}
