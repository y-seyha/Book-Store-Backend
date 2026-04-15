import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Books' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'All kinds of books', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}