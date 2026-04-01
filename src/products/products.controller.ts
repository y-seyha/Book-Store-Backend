import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {ProductsService} from "./products.service";
import {QueryProductDto} from "./dto/query.dto";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {RoleGuard} from "../auth/guard/role-guard.guard";
import {Roles} from "../auth/decorator/role-decorator";
import {CreateProductDto} from "./dto/create-product.dto";
import {CurrentUser} from "../auth/decorator/current-user.decorator";
import {UpdateProductDto} from "./dto/update-product.dto";



@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller','customer')
    async create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
        return this.productsService.create(dto, user.id);
    }


    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller','customer')
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller', 'customer')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}