import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../../common/entities/payment.entity';

export class QueryPaymentDto {
    @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filter by payment status' })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filter by payment method' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Search by order ID, user email, or payment ID' })
    @IsOptional()
    @IsString()
    search?: string;
}