import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Seller} from "../common/entities/seller.entity";
import {DataSource, Repository} from "typeorm";
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

        private dataSource: DataSource,
    ) {}

    // Become a seller
    async becomeSeller(user: User, dto: CreateSellerDto) {
        return this.dataSource.transaction(async (manager) => {
            const sellerRepo = manager.getRepository(Seller);
            const userRepo = manager.getRepository(User);

            const existing = await sellerRepo.findOne({
                where: { user: { id: user.id } },
            });

            if (existing) {
                throw new ForbiddenException('You are already a seller');
            }

            if (!dto.store_name) {
                throw new BadRequestException('Store name is required');
            }

            const seller = sellerRepo.create({
                ...dto,
                user,
            });

            const savedSeller = await sellerRepo.save(seller);

            // upgrade role safely
            if (user.role !== 'seller') {
                user.role = 'seller';
                await userRepo.save(user);
            }

            return savedSeller;
        });
    }

    async updateSeller(user: User, dto: UpdateSellerDto) {
        const seller = await this.getSellerByUserId(user.id);

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        Object.assign(seller, {
            store_name: dto.store_name ?? seller.store_name,
            store_description: dto.store_description ?? seller.store_description,
            store_address: dto.store_address ?? seller.store_address,
            phone: dto.phone ?? seller.phone,
            logo_url: dto.logo_url ?? seller.logo_url,
        });

        return this.sellerRepo.save(seller);
    }

    async findOneByUser(userId: string) {
        const seller = await this.getSellerByUserId(userId);

        if (!seller)
            throw new NotFoundException('Seller not found');

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

        if (!seller)
            throw new NotFoundException('Seller not found');

        return seller;
    }


    async updateSellerByAdmin(id: string, dto: UpdateSellerDto) {
        const seller = await this.findOne(id);

        Object.assign(seller, {
            store_name: dto.store_name ?? seller.store_name,
            store_description: dto.store_description ?? seller.store_description,
            store_address: dto.store_address ?? seller.store_address,
            phone: dto.phone ?? seller.phone,
            logo_url: dto.logo_url ?? seller.logo_url,
        });

        return this.sellerRepo.save(seller);
    }

    async removeByAdmin(id: string) {
        const seller = await this.findOne(id);
        await this.sellerRepo.remove(seller);

        return {
            success: true,
            message: "Seller deleted successfully",
        };
    }

    private async getSellerByUserId(userId: string) {
        return this.sellerRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    }

}
