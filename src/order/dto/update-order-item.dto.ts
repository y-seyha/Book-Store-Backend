import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderItemStatus } from '../../common/entities/order-item.entity';

export class UpdateOrderItemDto {
    @ApiProperty({ enum: OrderItemStatus })
    @IsEnum(OrderItemStatus)
    status: OrderItemStatus;
}