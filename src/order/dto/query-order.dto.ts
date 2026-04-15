import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../../common/entities/order.entity';

export class QueryOrderDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({ description: 'Search by order id or user email' })
    @IsOptional()
    @IsString()
    search?: string;
}