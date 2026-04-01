import {
    Body,
    Controller,
    Get,
    Param,
    Post, Req,
    UseGuards
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentUser } from "../auth/decorator/current-user.decorator";

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {

    constructor(private readonly orderService: OrderService) {}


    @Post()
    async create(
        @CurrentUser() user: any,
        @Body() dto: CreateOrderDto
    ) {
        return this.orderService.createOrder(user.id, dto);
    }

    @Get('me')
    async myOrders(@CurrentUser() user: any) {
        return this.orderService.findMyOrders(user.id);
    }

    @Get()
    async findAll() {
        return this.orderService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.orderService.findOne(id);
    }


}