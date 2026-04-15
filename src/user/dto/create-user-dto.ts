import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength} from 'class-validator';


export enum Role {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    SELLER = 'seller',
    DRIVER = 'driver',
}

export class CreateUserDto {
    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123' })
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Password must contain letters and numbers',
    })
    password: string;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString()
    first_name?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiProperty({ example: '012345678', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ enum: Role, example: Role.CUSTOMER })
    @IsEnum(Role)
    role: Role;
}