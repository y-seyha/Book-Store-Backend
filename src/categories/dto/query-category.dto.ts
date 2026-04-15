import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCategoryDto {
    @ApiPropertyOptional({ description: 'Search by category name' })
    @IsOptional()
    @IsString()
    search?: string;
}