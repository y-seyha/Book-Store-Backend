import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ description: 'Name of the product', example: 'iPhone 14' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @ApiPropertyOptional({ description: 'Product description', example: 'Latest Apple iPhone' })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;

    @ApiProperty({ description: 'Price of the product', example: 999.99, minimum: 0.01 })
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0.01, { message: 'Price must be greater than 0' })
    @Type(() => Number)
    price: number;

    @ApiPropertyOptional({ description: 'Stock quantity', example: 10, minimum: 0 })
    @IsOptional()
    @IsInt({ message: 'Stock must be an integer' })
    @Min(0, { message: 'Stock cannot be negative' })
    @Type(() => Number)
    stock?: number;

    @ApiPropertyOptional({ description: 'Category ID', example: 1 })
    @IsOptional()
    @IsInt({ message: 'Category ID must be an integer' })
    @Type(() => Number)
    categoryId?: number;

    @ApiPropertyOptional({ description: 'URL of product image', example: 'https://example.com/image.jpg' })
    @IsOptional()
    @IsString({ message: 'Image URL must be a string' })
    image_url?: string;

    @ApiPropertyOptional({ description: 'Cloudinary public ID for image', example: 'abc123' })
    @IsOptional()
    @IsString({ message: 'Image public ID must be a string' })
    image_public_id?: string;
}