import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Order} from "../common/entities/order.entity";
import {DataSource, Repository} from "typeorm";
import {OrderItem} from "../common/entities/order-item.entity";
import {Product} from "../common/entities/product.entity";
import {CreateOrderDto} from "./dto/create-order.dto";
import {User} from "../common/entities/user.entity";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepo : Repository<Order>,

        @InjectRepository(OrderItem)
        private orderItemRepo : Repository<OrderItem>,

        @InjectRepository(Product)
        private productRepo : Repository<Product>,



        private dataSource: DataSource
    ) {
    }

    async createOrder(userId : string , createOrderDto : CreateOrderDto )  {
        return await  this.dataSource.transaction(async  manager => {
            const user = await manager.findOne(User, {where : {id : userId}});
            if(!user)
                throw new NotFoundException("User not found");

            let total = 0;

            const order = manager.create(Order, {
                user,
                shipping_name: createOrderDto.shipping_name,
                shipping_phone: createOrderDto.shipping_phone,
                shipping_address: createOrderDto.shipping_address,
                shipping_city: createOrderDto.shipping_city,
                total_price: "0"
            })

            await  manager.save(order)

            const orderItems : OrderItem[] = []

            for(const item of createOrderDto.items){
                const product = await manager.findOne(Product, {
                    where : {id : item.product_id}
                })

                if(!product)
                    throw new NotFoundException(`Product ${item.product_id} not found`);

                const price = Number(product.price)
                total += price * item.quantity;

                const orderItem = manager.create(OrderItem, {
                    order, product, quantity : item.quantity, price : price.toString()
                })

                orderItems.push(orderItem)
            }

            await  manager.save(orderItems)

            order.total_price = total.toFixed(2);
            await manager.save(order)

            return order;
        })
    }

    async  findAll(){
        return this.orderRepo.find({
            relations : ['user','items','items.product']
        })
    }

    async  findMyOrders (userId : string){
        return this.orderRepo.find({
            where : {user : {id :userId}},
            relations : ['user','items','items.product'],
            order : {created_at : 'DESC'}
        })
    }

    async  findOne(id : number){
        const order = await  this.orderRepo.findOne({
            where : {id },
            relations : ['user','items','items.product'],

        })

        if(!order)
            throw  new NotFoundException('Order not found')

        return order;
    }


}
