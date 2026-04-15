import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../common/entities/user.entity";
import {DataSource, Repository} from "typeorm";
import {DriverProfile} from "../common/entities/driver_profile.entity";
import {CreateDriverWithUserDto} from "./dto/create-driver.dto";
import {Account} from "../common/entities/account.entity";
import {UpdateDriverDto} from "./dto/update-driver.dto";

@Injectable()
export class DeliveryDriverService {

  constructor(
      @InjectRepository(User)
      private userRepo: Repository<User>,

      @InjectRepository(DriverProfile)
      private driverRepo: Repository<DriverProfile>,

      @InjectRepository(Account)
      private accountRepo: Repository<Account>,

      private dataSource: DataSource
  ) {
  }

    async createDriver(createDriverDto: CreateDriverWithUserDto) {

        return this.dataSource.transaction(async manager => {
            const existingEmail = await manager.findOne(User, {
                where: { email: createDriverDto.email }
            });

            if (existingEmail)
                throw new ConflictException('Email already exists');

            const user = manager.create(User, {
                email: createDriverDto.email,
                first_name: createDriverDto.first_name,
                last_name: createDriverDto.last_name,
                phone: createDriverDto.phone,
                role: 'driver'
            });
            const savedUser = await manager.save(user);

            const account = manager.create(Account, {
                user: savedUser,
                provider: 'local',
                provider_account_id: savedUser.id,
            });

            const savedAccount = await manager.save(account);

            const driver = manager.create(DriverProfile, {
                user: savedUser,
                plate_number: createDriverDto.plate_number,
                vehicle_type: createDriverDto.vehicle_type,
                is_available: true
            });

            const savedDriver = await manager.save(driver);

            return {
                message: 'Driver created successfully',
                user: savedUser,
                account: savedAccount,
                driver: savedDriver
            };
        });
    }

    async  findAll(){
      return this.driverRepo.find({
          relations: ['user']
      });
  }

    async findOne(id: number) {
        return this.driverRepo.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async update(id: number, dto: UpdateDriverDto) {
        const driver = await this.driverRepo.findOne({
            where: { id },
            relations: ['user']
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        // 🚚 update driver fields
        if (dto.plate_number !== undefined) {
            driver.plate_number = dto.plate_number;
        }

        if (dto.vehicle_type !== undefined) {
            driver.vehicle_type = dto.vehicle_type;
        }

        if (dto.is_available !== undefined) {
            driver.is_available = dto.is_available;
        }

        if (driver.user) {

            if (dto.email !== undefined) {
                driver.user.email = dto.email;
            }

            if (dto.first_name !== undefined) {
                driver.user.first_name = dto.first_name;
            }

            if (dto.last_name !== undefined) {
                driver.user.last_name = dto.last_name;
            }

            if (dto.phone !== undefined) {
                driver.user.phone = dto.phone;
            }

            await this.userRepo.save(driver.user);
        }

        return this.driverRepo.save(driver);
    }




    async remove(id: number) {
      const driver = await  this.driverRepo.findOne({
          where: { id },
          relations: ['user']
      });

      if (!driver)
          throw new NotFoundException('Driver not found');

      const userId = driver.user.id;

        await this.driverRepo.delete(id);

        await this.accountRepo.delete({
            user: { id: userId }
        });

        await this.userRepo.delete(userId);

        return {
            message : `Deleted Drive with ID ${id} Successfully`
        }
    }
}
