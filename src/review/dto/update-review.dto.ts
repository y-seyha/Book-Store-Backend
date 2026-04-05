import { PartialType } from "@nestjs/mapped-types";
import { CreateReviewDto } from "./create-review.dto";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    @ApiPropertyOptional({ description: 'Updated rating for the product (1-5)', example: 4, minimum: 1, maximum: 5 })
    rating?: number;

    @ApiPropertyOptional({ description: 'Updated comment for the review', example: 'Updated comment text' })
    comment?: string;
}