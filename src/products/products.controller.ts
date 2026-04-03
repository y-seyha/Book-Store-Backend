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

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly fileUploadService: FileUploadService, // inject FileUploadService
    ) {}

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
    @Roles('admin', 'seller', 'customer')
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateProductDto,
        @CurrentUser() user: any,
    ) {
        let uploadedFile;

        if (file) {
            uploadedFile = await this.fileUploadService.uploadFile(
                file,
                dto.description, // optional description field in CreateProductDto
                user,
            );
        }

        return this.productsService.create(dto, user.id, uploadedFile);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', 'seller', 'customer')
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