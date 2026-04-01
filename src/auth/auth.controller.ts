import {Body, Controller, Post, Req, Res} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDTO} from "./dto/register.dto";
import {VerifyEmailDTO} from "./dto/verify-email.dto";
import {LoginDto} from "./dto/login.dto";
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async  register(@Body() registerDto : RegisterDTO) {
        return this.authService.register(registerDto);
    }

    @Post('verify-email')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({passthrough: true}) res : Response) {
        return this.authService.login(loginDto, res);
    }

    // @Post('refresh-token')
    // async refreshToken(@Body('token') token: string) {
    //     return this.authService.refreshToken(token);
    // }

    @Post('refresh-token')
    refresh(@Req() req: Request) {
        return this.authService.refreshToken(req);
    }
}
