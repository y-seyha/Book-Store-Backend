import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {Account} from "../common/entities/account.entity";
import {User} from "../common/entities/user.entity";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MailerService} from "../utils/mailer.util";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {GoogleStrategy} from "./strategies/google.strategy";
import {FacebookOAuthStrategy} from "./strategies/facebook.strategy";
import {GithubStrategy} from "./strategies/github.strategy";
import {JwtStrategy} from "./strategy/jwt.strategy";

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
    }),
  ],

  providers: [AuthService, MailerService, GoogleStrategy, FacebookOAuthStrategy,GithubStrategy,JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
