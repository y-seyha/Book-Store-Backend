import { Module } from '@nestjs/common';
import { DeliveryDriverController } from './delivery_driver.controller';
import { DeliveryDriverService } from './delivery_driver.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DriverProfile} from "../common/entities/driver_profile.entity";
import {User} from "../common/entities/user.entity";
import {Account} from "../common/entities/account.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverProfile, User,Account])
  ],
  controllers: [DeliveryDriverController],
  providers: [DeliveryDriverService],
  exports: [DeliveryDriverService]
})
export class DeliveryDriverModule {}
