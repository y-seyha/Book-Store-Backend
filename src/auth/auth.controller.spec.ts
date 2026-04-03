import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetpasswordDto } from './dto/resetpassword.dto';
import type { Request, Response } from 'express';

jest.mock('./guard/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true),
  })),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register and return result', async () => {
      const dto: RegisterDTO = {
        email: 'test@gmail.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const serviceResponse = { message: 'Registered successfully' };
      mockAuthService.register.mockResolvedValue(serviceResponse);

      const result = await controller.register(dto);

      expect(result).toBe(serviceResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from AuthService', async () => {
      const dto: RegisterDTO = {
        email: 'test@gmail.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockAuthService.register.mockRejectedValue(new Error('Email exists'));

      await expect(controller.register(dto)).rejects.toThrow('Email exists');
    });
  });

  describe('verifyEmail', () => {
    it('should call AuthService.verifyEmail and return result', async () => {
      const dto: VerifyEmailDTO = { token: 'token' };
      const serviceResponse = { message: 'Email verified' };
      mockAuthService.verifyEmail.mockResolvedValue(serviceResponse);

      const result = await controller.verifyEmail(dto);

      expect(result).toBe(serviceResponse);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from AuthService', async () => {
      const dto: VerifyEmailDTO = { token: 'invalid' };
      mockAuthService.verifyEmail.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.verifyEmail(dto)).rejects.toThrow('Invalid token');
    });
  });

  describe('login', () => {
    it('should call AuthService.login, return result, and set cookies', async () => {
      const dto: LoginDto = { email: 'test@gmail.com', password: '123' };
      const res: Partial<Response> = { cookie: jest.fn() };

      mockAuthService.login.mockImplementation(async (_dto, _res: Response) => {
        _res.cookie('access_token', 'token', { httpOnly: true });
        _res.cookie('refresh_token', 'token', { httpOnly: true });
        return { accessToken: 'token', refreshToken: 'token', user: {} };
      });

      const result = await controller.login(dto, res as Response);

      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token', user: {} });
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'token', expect.any(Object));
      expect(mockAuthService.login).toHaveBeenCalledWith(dto, res);
    });
  });

  describe('refresh', () => {
    it('should call AuthService.refreshToken and return result', async () => {
      const req: Partial<Request> = { cookies: { refresh_token: 'token' } };
      const serviceResponse = { accessToken: 'newToken' };
      mockAuthService.refreshToken.mockResolvedValue(serviceResponse);

      const result = await controller.refresh(req as Request);

      expect(result).toBe(serviceResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(req);
    });

    it('should propagate errors from AuthService', async () => {
      const req: Partial<Request> = { cookies: { refresh_token: 'token' } };
      mockAuthService.refreshToken.mockRejectedValue(new Error('Token invalid'));

      await expect(controller.refresh(req as Request)).rejects.toThrow('Token invalid');
    });
  });

  describe('forgotPassword', () => {
    it('should call AuthService.forgotPassword and return result', async () => {
      const dto: ForgotPasswordDto = { email: 'a@a.com' };
      const serviceResponse = { message: 'Reset email sent' };
      mockAuthService.forgotPassword.mockResolvedValue(serviceResponse);

      const result = await controller.forgotPassword(dto);

      expect(result).toBe(serviceResponse);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from AuthService', async () => {
      const dto: ForgotPasswordDto = { email: 'a@a.com' };
      mockAuthService.forgotPassword.mockRejectedValue(new Error('User not found'));

      await expect(controller.forgotPassword(dto)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should call AuthService.resetPassword and return result', async () => {
      const dto: ResetpasswordDto = { token: 'token', newPassword: '123' };
      const serviceResponse = { message: 'Password reset successfully' };
      mockAuthService.resetPassword.mockResolvedValue(serviceResponse);

      const result = await controller.resetPassword(dto);

      expect(result).toBe(serviceResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from AuthService', async () => {
      const dto: ResetpasswordDto = { token: 'invalid', newPassword: '123' };
      mockAuthService.resetPassword.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.resetPassword(dto)).rejects.toThrow('Invalid token');
    });
  });

  describe('getMe', () => {
    it('should return current user', () => {
      const req = { user: { id: 1, email: 'test@test.com' } } as unknown as Request;
      const result = controller.getMe(req);

      expect(result).toEqual({ user: { id: 1, email: 'test@test.com' } });
    });
  });
});