import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {Account} from "../common/entities/account.entity";
import {User} from "../common/entities/user.entity";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MailerService} from "../utils/mailer.util";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
      TypeOrmModule.forFeature([User,Account]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    })
  ],

  providers: [AuthService, MailerService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
