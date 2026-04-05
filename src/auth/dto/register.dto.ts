import { IsEmail, IsNotEmpty, MinLength, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDTO {
    @ApiProperty({ description: 'User email', example: 'user@example.com' })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @ApiProperty({ description: 'User password', minLength: 6, example: 'password123' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiPropertyOptional({ description: 'User first name', example: 'John', maxLength: 50 })
    @IsOptional()
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    firstName?: string;

    @ApiPropertyOptional({ description: 'User last name', example: 'Doe', maxLength: 50 })
    @IsOptional()
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    lastName?: string;
}