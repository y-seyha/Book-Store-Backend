import { IsOptional, IsInt, IsString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit?: number = 10;

    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Category ID must be an integer' })
    categoryId?: number;

    @IsOptional()
    @IsString({ message: 'Sort field must be a string' })
    @IsIn(['price', 'name', 'created_at'], {
        message: 'SortBy must be one of: price, name, created_at',
    })
    sortBy?: string = 'created_at';

    @IsOptional()
    @IsString({ message: 'Order must be a string' })
    @IsIn(['ASC', 'DESC'], {
        message: 'Order must be either ASC or DESC',
    })
    order?: 'ASC' | 'DESC' = 'DESC';
}