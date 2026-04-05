import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetpasswordDto } from './dto/resetpassword.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import type { Request, Response } from 'express';
import {LoginThrottlerGuard} from "./guard/login-throttler.guard";

@ApiTags('Auth') // grouping in Swagger UI
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    getMe(@Req() req: Request) {
        return { user: req.user };
    }

    @Post('register')
    @ApiBody({ type: RegisterDTO }) // specify DTO
    async register(@Body() registerDto: RegisterDTO) {
        return this.authService.register(registerDto);
    }

    @Post('verify-email')
    @ApiBody({ type: VerifyEmailDTO })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    @UseGuards(LoginThrottlerGuard)
    @Post('login')
    @ApiBody({ type: LoginDto })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(loginDto, res);
    }

    @Post('forgot-password')
    @ApiBody({ type: ForgotPasswordDto })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiBody({ type: ResetpasswordDto })
    async resetPassword(@Body() resetPasswordDto: ResetpasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
    async refresh(@Req() req: Request) {
        return this.authService.refreshToken(req);
    }
}