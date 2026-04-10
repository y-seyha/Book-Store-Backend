import {Controller, Post, Body, Get, Req, Res, UseGuards, BadRequestException} from '@nestjs/common';
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
import type {AuthRequest} from "./interface/auth-request.interface";
import {AuthGuard} from "@nestjs/passport";

@ApiTags('Auth') // grouping in Swagger UI
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) { // req.user injected by JwtAuthGuard
        const userPayload = req.user;
        if (!userPayload?.id) {
            throw new BadRequestException('User not found');
        }

        // Fetch full profile from DB
        const user = await this.authService.findUserById(userPayload.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                phone: user.phone,
                avatar_url: user.avatar_url,
                role: user.role,
                is_verified: user.is_verified,
            },
        };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        // Clear cookies — must match exactly what you set during login
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false, // true if in production https
            sameSite: 'lax',
            path: '/',
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });

        return { message: 'Logged out successfully' };
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

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: Request) {
        // Initiates OAuth flow. Nothing else needed.
    }
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        const user = req.user;

        res.cookie('access_token', user.accessToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', user.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect(`${process.env.FRONTEND_URL}?login=success`);
    }

    // Facebook
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() {}

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookRedirect(@Req() req: any, @Res() res: Response) {
        const user = req.user;

        res.cookie('access_token', user.accessToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', user.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.redirect(`${process.env.FRONTEND_URL}?login=success`);
    }


    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth() {}

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubRedirect(@Req() req: any, @Res() res: Response) {
        const user = req.user;

        res.cookie('access_token', user.accessToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', user.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.redirect(`${process.env.FRONTEND_URL}?login=success`);
    }

}