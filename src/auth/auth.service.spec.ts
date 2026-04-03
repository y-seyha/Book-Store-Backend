jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'newhash'),
  compare: jest.fn(async () => true),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {User} from "../common/entities/user.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Account} from "../common/entities/account.entity";
import {JwtService} from "@nestjs/jwt";
import {MailerService} from "../utils/mailer.util";
import {BadRequestException, ForbiddenException, UnauthorizedException} from "@nestjs/common";
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne : jest.fn(),
    create : jest.fn(),
    save : jest.fn(),
  }

  const mockAccountRepo = {
    findOne : jest.fn(),
    create : jest.fn(),
    save : jest.fn(),
  }

  const mockJwtService : Partial<JwtService> ={
    sign : jest.fn().mockReturnValue('signed-token'),
    verify : jest.fn(),
  }

  const mockMailer = {
    sendVerificationEmail : jest.fn(),
    sendPasswordResetEmail : jest.fn(),
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {provide : getRepositoryToken(User), useValue : mockUserRepo},
        {provide : getRepositoryToken(Account), useValue : mockAccountRepo },
        {provide : JwtService, useValue : mockJwtService},
        {provide : MailerService, useValue : mockMailer}
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const dto = { email: 'test@test.com', password: '123456', firstName: 'John', lastName: 'Doe' };

      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(data => data);
      mockUserRepo.save.mockResolvedValue({ id: 1, ...dto });

      mockAccountRepo.create.mockImplementation(data => data);
      mockAccountRepo.save.mockResolvedValue({});

      const result = await service.register(dto);

      expect(result).toEqual({
        message: 'Registration successful. Please check your email for verification.',
      });

      expect(mockMailer.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw if email exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 1 });
      await expect(
          service.register({ email: 'test@test.com', password: '123', firstName: 'a', lastName: 'b' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail',() => {
    it('should verify email successfully', async () => {
      const user = {is_verified : false, email_verification_token : 'token'}
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await  service.verifyEmail({token : 'token'})
      expect(result).toEqual({message : "Email verified successfully. You can now log in."})
      expect(user.is_verified).toBe(true);
    })

    it('should throw error for invalid token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null)
      await  expect(service.verifyEmail({token : 'invalid'})).rejects.toThrow(BadRequestException);
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const user = {id : 1, role : 'customer', is_verified: true}
      const account = {user, password_hash : await bcrypt.hash('123',10)}
      mockAccountRepo.findOne.mockResolvedValue(account);

      const response : any  = {cookie : jest.fn()};
      const result = await service.login({email : 'a@a', password : '123'}, response)

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user).toBe(user)
      expect(response.cookie).toHaveBeenCalledTimes(2);
    })

    it('should throw error for email is not verified', async () => {
      const user = {is_verified : false,}
      const acccount = {user, password_hash: await bcrypt.hash('123',10)}
      mockAccountRepo.findOne.mockResolvedValue(acccount);
      await  expect(service.login({email : 'a@a.com', password : '123'}, {} as any )).rejects.toThrow(ForbiddenException);
    })
  });

  describe('forgotPassword', () => {
    it('should send reset email if user exists', async () => {
      const user = { email: 'a@a.com' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.forgotPassword({ email: 'a@a.com' });
      expect(result).toEqual({ message: 'We have been sent token to your email successfully.' });
      expect(mockMailer.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return generic message if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'a@a.com' });
      expect(result).toEqual({ message: 'If that email exists, a reset link has been sent to that email' });
    });
  });


  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetDto = { token: 'token', newPassword: 'newPassword' };
      const user = { email: 'a@a.com', password_reset_token: 'token', password_reset_expires: new Date(Date.now() + 10000) };
      const account = { password_hash: 'oldhash' };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.save.mockResolvedValue(account);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.resetPassword(resetDto);

      expect(result).toEqual({ message: 'Password reset successfully.' });
      expect(account.password_hash).toBe('newhash'); // ✅ now passes
      expect(user.password_reset_token).toBeNull();
      expect(user.password_reset_expires).toBeNull();
    });

    it('should throw error for invalid token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await  expect(service.resetPassword({token : 'token', newPassword : '123'})).rejects.toThrow(BadRequestException);
    })
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const req: any = { cookies: { refresh_token: 'token' } };
      mockJwtService.verify = jest.fn().mockReturnValue({ userId: 1, role: 'customer' });

      const result = await  service.refreshToken(req)
      expect(result.accessToken).toBe('signed-token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    })

    it('should throw an error if no token provided', async () => {
      const req : any = {cookies : {}}
      await  expect(service.refreshToken(req)).rejects.toThrow(UnauthorizedException);
    })

    it('should throw an error if token invalid', async () => {
      const req: any = { cookies: { refresh_token: 'token' } };
      mockJwtService.verify = jest.fn(() => {throw new Error(); })
      await  expect(service.refreshToken(req)).rejects.toThrow(UnauthorizedException);
    })
  })

});



