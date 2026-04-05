import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiPropertyOptional({
        description: 'Recipient name for shipping',
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    shipping_name?: string;

    @ApiPropertyOptional({
        description: 'Phone number for shipping',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    shipping_phone?: string;

    @ApiPropertyOptional({
        description: 'Shipping address',
        example: '123 Main St, Apt 4B',
    })
    @IsOptional()
    @IsString()
    shipping_address?: string;

    @ApiPropertyOptional({
        description: 'City for shipping',
        example: 'New York',
    })
    @IsOptional()
    @IsString()
    shipping_city?: string;

    @ApiProperty({
        description: 'List of items in the order',
        type: [OrderItemDto],
    })
    @IsArray({ message: 'Items must be an array' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}