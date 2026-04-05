import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth() // JWT auth in Swagger
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    @ApiOperation({ summary: 'Get the current user’s cart' })
    async getCart(@CurrentUser() user: any) {
        return this.cartService.getUserCart(user.id);
    }

    @Post('add')
    @ApiOperation({ summary: 'Add a product to the cart' })
    @ApiBody({ type: AddToCartDto })
    async addToCart(
        @CurrentUser() user: any,
        @Body() addToCartDto: AddToCartDto,
    ) {
        return this.cartService.addToCart(user.id, addToCartDto);
    }

    @Patch('/:cartItemId')
    @ApiOperation({ summary: 'Update quantity of a cart item' })
    @ApiParam({ name: 'cartItemId', description: 'ID of the cart item', type: Number })
    @ApiBody({ type: UpdateCartItemDto })
    async updateCartItem(
        @CurrentUser() user: any,
        @Param('cartItemId', ParseIntPipe) cartItemId: number,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateCartItem(user.id, cartItemId, updateCartItemDto);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear all items from the cart' })
    async clearCart(@CurrentUser() user: any) {
        return this.cartService.clearCart(user.id);
    }

    @Delete('/:cartItemId')
    @ApiOperation({ summary: 'Remove a specific item from the cart' })
    @ApiParam({ name: 'cartItemId', description: 'ID of the cart item to remove', type: Number })
    async removeFromCart(
        @CurrentUser() user: any,
        @Param('cartItemId', ParseIntPipe) cartItemId: number,
    ) {
        return this.cartService.removeFromCart(user.id, cartItemId);
    }
}