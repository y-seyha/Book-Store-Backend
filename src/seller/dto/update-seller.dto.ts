import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerDto } from './create-seller.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {
    @ApiPropertyOptional({ description: 'Updated store name', example: 'SuperBooks Store' })
    store_name?: string;

    @ApiPropertyOptional({ description: 'Updated store description', example: 'We sell books and stationery' })
    store_description?: string;

    @ApiPropertyOptional({ description: 'Updated store address', example: '123 Main St, Phnom Penh' })
    store_address?: string;

    @ApiPropertyOptional({ description: 'Updated contact phone number', example: '+85512345678' })
    phone?: string;

    @ApiPropertyOptional({ description: 'Updated logo URL', example: 'https://example.com/logo.png' })
    logo_url?: string;
}