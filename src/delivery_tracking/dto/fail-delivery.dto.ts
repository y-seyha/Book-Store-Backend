import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FailDeliveryDto {
    @ApiProperty({ example: 'Customer not available' })
    @IsString()
    reason: string;
}