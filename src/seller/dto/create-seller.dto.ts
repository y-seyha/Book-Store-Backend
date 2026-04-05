import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerDto {
    @ApiProperty({ description: 'Name of the store', example: 'SuperBooks Store' })
    @IsNotEmpty({ message: 'Store name is required' })
    @IsString({ message: 'Store name must be a string' })
    @MaxLength(100, { message: 'Store name cannot exceed 100 characters' })
    store_name: string;

    @ApiPropertyOptional({ description: 'Description of the store', example: 'We sell books and stationery' })
    @IsOptional()
    @IsString({ message: 'Store description must be a string' })
    @MaxLength(500, { message: 'Store description cannot exceed 500 characters' })
    store_description?: string;

    @ApiPropertyOptional({ description: 'Address of the store', example: '123 Main St, Phnom Penh' })
    @IsOptional()
    @IsString({ message: 'Store address must be a string' })
    @MaxLength(200, { message: 'Store address cannot exceed 200 characters' })
    store_address?: string;

    @ApiPropertyOptional({ description: 'Contact phone number', example: '+85512345678' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Logo URL of the store', example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    logo_url?: string;
}