import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
    @ApiProperty({
        description: 'ID of the product being ordered',
        example: 101,
    })
    @IsNotEmpty({ message: 'Product ID is required' })
    product_id: number;

    @ApiProperty({
        description: 'Quantity of the product (minimum 1)',
        example: 2,
        minimum: 1,
    })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @ApiProperty({
        description: 'Snapshot price of the product at the time of order',
        example: 29.99,
    })
    @IsNumber({}, { message: 'Price must be a number' })
    price: number;
}