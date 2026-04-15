import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignDriverDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    driverProfileId: number;
}