import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new order from the user cart' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(user.id, dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user’s orders' })
    @ApiResponse({ status: 200, description: 'Returns a list of orders for the current user' })
    async myOrders(@CurrentUser() user: any) {
        return this.orderService.findMyOrders(user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders (Admin)' })
    @ApiResponse({ status: 200, description: 'Returns a list of all orders' })
    async findAll() {
        return this.orderService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of a specific order by ID' })
    @ApiParam({ name: 'id', description: 'ID of the order', type: Number })
    @ApiResponse({ status: 200, description: 'Returns the order details' })
    async findOne(@Param('id') id: number) {
        return this.orderService.findOne(id);
    }
}