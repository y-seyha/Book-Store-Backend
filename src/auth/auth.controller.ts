import {Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDTO} from "./dto/register.dto";
import {VerifyEmailDTO} from "./dto/verify-email.dto";
import {LoginDto} from "./dto/login.dto";
import type { Request, Response } from 'express';
import {AuthGuard} from "@nestjs/passport";
import {JwtAuthGuard} from "./guard/jwt-auth.guard";
import {ForgotPasswordDto} from "./dto/forgotPassword.dto";
import {ResetpasswordDto} from "./dto/resetpassword.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req : Request) {
        const user = req.user;
        return {user};
    }

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

    //OAuth
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Passport will redirect to Google automatically
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: Request, @Res() res : Response) {
        const {accessToken , refreshToken, user} = req.user as any;

        res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 15*60*1000 });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });

        return res.json({
            message: 'Google login successful',
            accessToken,
            refreshToken,
            user,
        });
        // res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
    }

    // Facebook
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() {}

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req: Request, @Res() res: Response) {
        const { accessToken, refreshToken, user } = req.user as any;
        return res.json({ message: 'Facebook login successful', accessToken, refreshToken, user });
    }

    // GitHub
    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth() {}

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Req() req: Request, @Res() res: Response) {
        const { accessToken, refreshToken, user } = req.user as any;
        return res.json({ message: 'GitHub login successful', accessToken, refreshToken, user });
    }

    @Post('forgot-password')
    async  forgotPassword(@Body() forgotPasswordDto : ForgotPasswordDto){
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto : ResetpasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }


}
