import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DeliveryStatus } from 'src/common/entities/delivery-tracking.entity';

export class UpdateStatusDto {
    @ApiProperty({
        example: 'on_the_way',
        enum: DeliveryStatus
    })
    @IsEnum(DeliveryStatus)
    status: DeliveryStatus;
}