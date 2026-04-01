import { IsEmail, IsNotEmpty, MinLength, IsOptional, MaxLength } from 'class-validator';

export class RegisterDTO {
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsOptional()
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    firstName?: string;

    @IsOptional()
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    lastName?: string;
}