import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    async getCart(@CurrentUser() user: any) {
        return this.cartService.getUserCart(user.id);
    }

    @Post('add')
    async addToCart(
        @CurrentUser() user: any,
        @Body() addToCartDto: AddToCartDto,
    ) {
        return this.cartService.addToCart(user.id, addToCartDto);
    }


    @Patch('/:cartItemId')
    async updateCartItem(
        @CurrentUser() user: any,
        @Param('cartItemId') cartItemId: number,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateCartItem(
            user.id,
            cartItemId,
            updateCartItemDto,
        );
    }


    @Delete('/:cartItemId')
    async removeFromCart(
        @CurrentUser() user: any,
        @Param('cartItemId') cartItemId: number,
    ) {
        return this.cartService.removeFromCart(user.id, cartItemId);
    }


    @Delete('clear')
    async clearCart(@CurrentUser() user: any) {
        console.log('Controller hit with user:', user);
        return this.cartService.clearCart(user.id);
    }
}