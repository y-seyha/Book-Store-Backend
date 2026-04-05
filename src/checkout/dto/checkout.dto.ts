import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../common/entities/payment.entity';

export class CheckoutDto {
    @ApiPropertyOptional({ description: 'Recipient name for shipping', example: 'John Doe' })
    @IsOptional()
    @IsString()
    shipping_name?: string;

    @ApiPropertyOptional({ description: 'Phone number for shipping', example: '+1234567890' })
    @IsOptional()
    @IsString()
    shipping_phone?: string;

    @ApiPropertyOptional({ description: 'Shipping address', example: '123 Main St, Apt 4B' })
    @IsOptional()
    @IsString()
    shipping_address?: string;

    @ApiPropertyOptional({ description: 'City for shipping', example: 'New York' })
    @IsOptional()
    @IsString()
    shipping_city?: string;

    @ApiPropertyOptional({
        description: 'Payment method',
        enum: PaymentMethod,
        example: PaymentMethod.COD,
        default: PaymentMethod.COD,
    })
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod = PaymentMethod.COD; // default COD
}