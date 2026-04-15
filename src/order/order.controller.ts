import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';

import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { Roles } from '../auth/decorator/role-decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}


    @Get('me')
    @ApiOperation({ summary: 'Get current user orders' })
    async myOrders(@CurrentUser() user: any) {
        return this.orderService.findMyOrders(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID (own only for user)' })
    @ApiParam({ name: 'id', type: Number })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        const order = await this.orderService.findOne(id);

        if (order.user.id !== user.id) {
            throw new ForbiddenException('Access denied');
        }

        return order;
    }

    //admin routes
    @Get()
    @UseGuards(RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get all orders (Admin dashboard)' })
    findAll(@Query() query: QueryOrderDto) {
        return this.orderService.adminFindAll(query);
    }

    @Patch(':id/status')
    @UseGuards(RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update order status (Admin)' })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateStatus(id, dto);
    }


    @Patch(':id/cancel')
    @UseGuards(RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Cancel order (Admin)' })
    cancelOrder(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CancelOrderDto,
    ) {
        return this.orderService.cancelOrder(id, dto);
    }

    @Patch(':id/items/:itemId')
    @UseGuards(RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update order item status (Admin)' })
    updateItem(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() dto: UpdateOrderItemDto,
    ) {
        return this.orderService.updateOrderItem(id, itemId, dto);
    }
}