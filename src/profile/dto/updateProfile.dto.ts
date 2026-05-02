import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsPhoneNumber,
    IsUrl,
    Length,
} from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        example: 'Seyha',
        description: 'User first name',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    first_name?: string;

    @ApiPropertyOptional({
        example: 'Chan',
        description: 'User last name',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    last_name?: string;

    @ApiPropertyOptional({
        example: '+85512345678',
        description: 'Phone number in international format (Cambodia: +855...)',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.png',
        description: 'Public URL of user avatar image',
    })
    @IsOptional()
    @IsUrl()
    avatar_url?: string;
}