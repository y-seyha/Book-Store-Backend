import { IsOptional, IsString, IsEnum } from "class-validator";
import { PaymentMethod } from "../../common/entities/payment.entity";

export class CheckoutDto {
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

    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod = PaymentMethod.COD; // default COD
}