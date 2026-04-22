import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsBoolean,
    IsEnum,
    IsEmail,
    MinLength,
} from 'class-validator';
import { Role } from './create-user-dto';

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: 'John' })
    @IsOptional()
    @IsString()
    first_name?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiPropertyOptional({ example: '012345678' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://image.url/avatar.png' })
    @IsOptional()
    @IsString()
    avatar_url?: string;

    @ApiPropertyOptional({ enum: Role })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    is_verified?: boolean;
}