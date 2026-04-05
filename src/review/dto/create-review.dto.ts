import { IsInt, IsNotEmpty, IsOptional, Max, Min, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
    @ApiProperty({ description: 'ID of the product being reviewed', example: 101 })
    @IsNotEmpty({ message: 'Product ID is required' })
    @IsInt({ message: 'Product ID must be an integer' })
    product_id: number;

    @ApiProperty({ description: 'Rating for the product (1-5)', example: 5, minimum: 1, maximum: 5 })
    @IsInt({ message: 'Rating must be an integer' })
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating cannot exceed 5' })
    rating: number;

    @ApiPropertyOptional({ description: 'Optional comment for the review', example: 'Great product, highly recommend!' })
    @IsOptional()
    @IsString({ message: 'Comment must be a string' })
    comment?: string;
}