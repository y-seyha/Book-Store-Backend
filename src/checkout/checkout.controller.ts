import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import {CheckoutDto} from "./dto/checkout.dto";
import {ApiBody, ApiOperation} from "@nestjs/swagger";

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) {}

    @Post()
    @ApiOperation({ summary: 'Checkout the cart and create an order' })
    @ApiBody({ type: CheckoutDto })
    async checkout(@Req() req, @Body() dto: CheckoutDto) {
        const userId = req.user.id;
        return this.checkoutService.checkout(userId, dto);
    }
}