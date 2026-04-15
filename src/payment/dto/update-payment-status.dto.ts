import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../common/entities/payment.entity';

export class UpdatePaymentStatusDto {
    @ApiProperty({ enum: PaymentStatus })
    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @ApiProperty({ required: false, description: 'Optional note for rejection' })
    @IsOptional()
    @IsString()
    note?: string;
}