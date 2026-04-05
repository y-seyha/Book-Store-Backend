import { IsOptional, IsInt, IsString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductDto {
    @ApiPropertyOptional({ description: 'Page number', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search term', example: 'iPhone' })
    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string;

    @ApiPropertyOptional({ description: 'Category ID filter', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Category ID must be an integer' })
    categoryId?: number;

    @ApiPropertyOptional({ description: 'Sort by field', enum: ['price', 'name', 'created_at'], default: 'created_at' })
    @IsOptional()
    @IsString({ message: 'Sort field must be a string' })
    @IsIn(['price', 'name', 'created_at'], { message: 'SortBy must be one of: price, name, created_at' })
    sortBy?: string = 'created_at';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
    @IsOptional()
    @IsString({ message: 'Order must be a string' })
    @IsIn(['ASC', 'DESC'], { message: 'Order must be either ASC or DESC' })
    order?: 'ASC' | 'DESC' = 'DESC';
}