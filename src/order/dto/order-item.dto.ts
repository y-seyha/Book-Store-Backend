import { IsInt, IsNotEmpty, IsNumber, Min } from "class-validator";

export class OrderItemDto {

    @IsNotEmpty()
    product_id: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    price: number; // snapshot price
}