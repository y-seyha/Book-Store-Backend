import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { DeliveryStatus } from 'src/common/entities/delivery-tracking.entity';

export class FilterDeliveryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(DeliveryStatus)
    status?: DeliveryStatus;

    @ApiPropertyOptional()
    @IsOptional()
    driverProfileId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    orderId?: number;
}