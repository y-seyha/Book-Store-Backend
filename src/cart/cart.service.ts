import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Cart} from "../common/entities/cart..entity";
import {Repository} from "typeorm";
import {CartItem} from "../common/entities/cart-item.entity";
import {Product} from "../common/entities/product.entity";
import {User} from "../common/entities/user.entity";
import {AddToCartDto} from "./dto/add-to-cart.dto";
import {UpdateCartItemDto} from "./dto/update-cart-item.dto";


@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly  cartRepository : Repository<Cart>,

        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,

        @InjectRepository(Product)
         private readonly productRepository: Repository<Product>,

        @InjectRepository (User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async getUserCart(userId: string): Promise<Cart> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'items', 'items.product'],
        });

        if (!cart) {
            cart = this.cartRepository.create({ user, items: [] });
            await this.cartRepository.save(cart);

            cart = await this.cartRepository.findOne({
                where: { id: cart.id },
                relations: ['user', 'items', 'items.product'],
            })!;

            if(!cart)
                throw new NotFoundException('Cart not found');

        }

        // fitter only show active
        cart.items = cart.items.filter(item => item.status === 'active');

        return cart;
    }

    async addToCart(userId: string, addToCartDto: AddToCartDto) {
        const { productId, quantity } = addToCartDto;

        const cart = await this.getUserCart(userId);

        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        // Check if item already exists in cart
        let item = cart.items.find(
            i => i.product.id === productId && i.status === 'active'
        );

        if (item) {
            // Update quantity of active item
            item.quantity += quantity;
            await this.cartItemRepository.save(item);
        } else {
            // Add new cart item as active
            item = this.cartItemRepository.create({ cart, product, quantity, status: 'active' });
            await this.cartItemRepository.save(item);
        }

        return this.getUserCart(userId);
    }

    async updateCartItem(
        userId: string,
        cartItemId: number,
        updateCartItemDto: UpdateCartItemDto
    ): Promise<Cart> {
        const { quantity } = updateCartItemDto;

        const cart = await this.getUserCart(userId);


        const item = cart.items.find(i => i.id === cartItemId);
        if (!item) throw new NotFoundException('Cart item not found');

        item.quantity = quantity;
        await this.cartItemRepository.save(item);

        return this.getUserCart(userId);
    }

    async removeFromCart(userId: string, cartItemId: number) {
        const cart = await this.getUserCart(userId);

        const item = cart.items.find(i => i.id === cartItemId);
        if (!item) throw new NotFoundException('Cart item not found');

        await this.cartItemRepository.remove(item);

        return { message: 'Item removed from cart successfully' };
    }

    async clearCart(userId: string): Promise<{ message: string }> {
        const cart = await this.getUserCart(userId);

        const activeItems = cart.items.filter(i => i.status === 'active');
        if (!activeItems.length) return { message: 'Cart is already empty' };

        const idsToDelete = activeItems.map(i => i.id);
        await this.cartItemRepository.delete(idsToDelete); // safer than remove

        return { message: 'Cart cleared successfully' };
    }
}
