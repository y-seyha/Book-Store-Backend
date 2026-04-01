import {
    IsArray,
    IsOptional,
    IsString,
    ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto {

    @IsOptional()
    @IsString()
    shipping_name?: string;

    @IsOptional()
    @IsString()
    shipping_phone?: string;

    @IsOptional()
    @IsString()
    shipping_address?: string;

    @IsOptional()
    @IsString()
    shipping_city?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}