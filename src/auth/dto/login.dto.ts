import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'User email', example: 'user@example.com' })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @ApiProperty({ description: 'User password', minLength: 6, example: 'password123' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}