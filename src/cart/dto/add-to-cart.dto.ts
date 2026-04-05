import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
    @ApiProperty({
        description: 'ID of the product to add to the cart',
        example: 101,
    })
    @IsInt({ message: 'Product ID must be an integer' })
    productId: number;

    @ApiProperty({
        description: 'Quantity of the product to add (minimum 1)',
        example: 2,
        minimum: 1,
    })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}