/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetpasswordDto } from './dto/resetpassword.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import type { Request, Response } from 'express';
import { LoginThrottlerGuard } from './guard/login-throttler.guard';
import { AuthGuard } from '@nestjs/passport';
import { getCookieOptions } from '../utils/cookie.util';

@ApiTags('Auth') // grouping in Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    // req.user injected by JwtAuthGuard
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
    res.clearCookie('access_token', getCookieOptions());
    res.clearCookie('refresh_token', getCookieOptions());

    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @ApiBody({ type: RegisterDTO }) // specify DTO
  register(
    @Body() dto: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Get('verify-email')
  async verifyEmail(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;

    const result = await this.authService.verifyEmail(token);

    res.cookie('access_token', result.accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/verify-success?success=true`,
    );
  }

  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(req);

    res.cookie('access_token', result.accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      result,
    };
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

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-success?accessToken=${user.accessToken}&refreshToken=${user.refreshToken}`,
    );
  }

  // Facebook
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-success?accessToken=${user.accessToken}&refreshToken=${user.refreshToken}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubRedirect(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-success?accessToken=${user.accessToken}&refreshToken=${user.refreshToken}`,
    );
  }

  @Post('set-cookie')
  setCookie(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = body;

    res.cookie('access_token', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
    };
  }
}
