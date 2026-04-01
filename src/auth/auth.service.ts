import {BadRequestException, ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import {User} from "../common/entities/user.entity";
import {MoreThan, Repository} from "typeorm";
import {Account} from "../common/entities/account.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {JwtService} from "@nestjs/jwt";
import {RegisterDTO} from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import crypto from 'crypto'
import {VerifyEmailDTO} from "./dto/verify-email.dto";
import {LoginDto} from "./dto/login.dto";
import {MailerService} from "../utils/mailer.util";
// import { Response } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo : Repository<User>,

        @InjectRepository(Account)
        private readonly  accountRepo : Repository<Account>,

        private jwtService : JwtService,
        private mailer: MailerService
    ) {

        }

    async register(registerDto : RegisterDTO){
        const {email, password,firstName,lastName} = registerDto;

        const existing = await  this.userRepo.findOne({
            where: {email}
        })
        if(existing)
            throw  new BadRequestException(('Email already exists'));

        const passwordHash = await  bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 3600 * 1000);

        const user = this.userRepo.create({
            email,
            first_name : firstName,
            last_name : lastName,
            email_verification_token: verificationToken,
            email_verification_expires: verificationExpires,
        });

        await  this.userRepo.save(user);

        //create account
        const account = this.accountRepo.create({
            user,
            provider : 'credentials',
            provider_account_id : email,
            password_hash : passwordHash
        })
        await  this.accountRepo.save(account);

        await this.mailer.sendVerificationEmail(email, verificationToken);

        return { message: 'Registration successful. Please check your email for verification.' };
    }


    async  verifyEmail(verifyEmailDto : VerifyEmailDTO){
        const user = await this.userRepo.findOne({
            where  : {
                email_verification_token: verifyEmailDto.token,
                email_verification_expires: MoreThan(new Date()),}

        })

        if(!user)
            throw new BadRequestException('Invalid or exired token');

        user.is_verified = true;
        user.email_verification_token = null;
        user.email_verification_expires = null;

        await  this.userRepo.save(user);
        return { message: 'Email verified successfully. You can now log in.' };
    }

    async login(loginDto: LoginDto, res : Response) {
        const { email, password } = loginDto;

        // Find account by email
        const account = await this.accountRepo.findOne({
            where: { provider: 'credentials', provider_account_id: email },
            relations: ['user'],
        });

        if (!account) throw new BadRequestException('Invalid credentials');

        // Check password
        const isMatch = await bcrypt.compare(password, account.password_hash);
        if (!isMatch) throw new BadRequestException('Invalid credentials');

        // Check if email verified
        if (!account.user.is_verified) throw new ForbiddenException('Email not verified');

        // Generate JWT
        const payload = { userId: account.user.id, role: account.user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        res.cookie('access_token', accessToken,{
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000, // 15 min
        })

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false, // dev
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken,
            refreshToken,
            user: account.user,
        };
    }

    async refreshToken(req : Request) {
        const token = req.cookies['refresh_token'];

        if(!token)
            throw  new UnauthorizedException('No refresh token')
        try {
            const payload = this.jwtService.verify(token);
            const accessToken = this.jwtService.sign(
                { userId: payload.userId, role: payload.role },
                { expiresIn: '15m' }
            );
            return { accessToken };
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}
