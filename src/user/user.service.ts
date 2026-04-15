import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../common/entities/user.entity";
import {DataSource, ILike, Repository} from "typeorm";
import {QueryUserDto} from "./dto/query-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {CreateUserDto} from "./dto/create-user-dto";
import * as bcrypt from "bcrypt";
import {Account} from "../common/entities/account.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Account)
        private readonly accountRepo: Repository<Account>,

        private readonly dataSource: DataSource,
    ) {
    }


    async  findAll(queryDto : QueryUserDto) {
        const {search, role, is_verified} = queryDto;

        const where: any = {};

        if(search)
            where.email = ILike(`%${search}%`);

        if(role)
            where.role = role;

        if (is_verified !== undefined)
            where.is_verified = is_verified;


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

        Object.assign(user, dto);

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
        if (existing)
            throw new BadRequestException('Email already exists');

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


}
