import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString({ message: 'Name must be a string' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;

    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0.01, { message: 'Price must be greater than 0' })
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsInt({ message: 'Stock must be an integer' })
    @Min(0, { message: 'Stock cannot be negative' })
    @Type(() => Number)
    stock?: number;

    @IsOptional()
    @IsInt({ message: 'Category ID must be an integer' })
    @Type(() => Number)
    categoryId?: number;

    @IsOptional()
    @IsString({ message: 'Image URL must be a string' })
    image_url?: string;

    @IsOptional()
    @IsString({ message: 'Image public ID must be a string' })
    image_public_id?: string;
}