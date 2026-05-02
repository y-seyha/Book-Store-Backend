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
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { Roles } from '../auth/decorator/role-decorator';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
import {CategoriesService} from "./categories.service";

@ApiTags('Categories (Admin)')
@ApiBearerAuth()
@Controller('admin/categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create category' })
    @ApiBody({ type: CreateCategoryDto })
    @ApiResponse({ status: 201, description: 'Category created' })
    async create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin', "seller")
    @ApiOperation({ summary: 'Get all categories' })
    async findAll(@Query() query: QueryCategoryDto) {
        return this.categoryService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiParam({ name: 'id', type: Number })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update category' })
    @ApiBody({ type: UpdateCategoryDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete category' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }
}