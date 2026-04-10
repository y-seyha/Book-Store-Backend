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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { QueryProductDto } from './dto/query.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { Roles } from '../auth/decorator/role-decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly fileUploadService: FileUploadService,
    ) {}


    @Get('categories/counts')
    async getCategoryCounts() {
        return this.productsService.getCategoryCounts();
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with optional filters, pagination, and sorting' })
    @ApiResponse({ status: 200, description: 'List of products returned' })
    async findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    @ApiParam({ name: 'id', description: 'ID of the product', type: Number })
    @ApiResponse({ status: 200, description: 'Product details returned' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Get('/categories/:id')
    async findByCategory(@Param('id', ParseIntPipe) categoryId : number, @Query() query: QueryProductDto) {
        return this.productsService.findByCategory(categoryId,query);
    }


    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Create a new product' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateProductDto })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateProductDto,
        @CurrentUser() user: any,
    ) {
        let uploadedFile;

        if (file) {
            uploadedFile = await this.fileUploadService.uploadFile(
                file,
                dto.description,
                user,
            );
        }

        return this.productsService.create(dto, user.id, uploadedFile);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller')
    @ApiOperation({ summary: 'Update a product by ID' })
    @ApiParam({ name: 'id', description: 'ID of the product to update', type: Number })
    @ApiBody({ type: UpdateProductDto })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller')
    @ApiOperation({ summary: 'Delete a product by ID' })
    @ApiParam({ name: 'id', description: 'ID of the product to delete', type: Number })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}