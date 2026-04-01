import { IsInt, IsNotEmpty, IsOptional, Max, Min, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    product_id: number;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}