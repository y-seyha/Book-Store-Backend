import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import {RoleGuard} from "../auth/guard/role-guard.guard";
import {Roles} from "../auth/decorator/role-decorator";

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    // GET /reviews?product_id=1&rating=5&page=1&limit=10&sort=rating&order=DESC
    @Get()
    @ApiOperation({ summary: 'Get list of reviews with optional filters and pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'product_id', required: false, type: Number, description: 'Filter by product ID' })
    @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating (1-5)' })
    @ApiQuery({ name: 'sort', required: false, enum: ['rating', 'created_at'], description: 'Sort by field' })
    @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'List of reviews returned successfully' })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('product_id') product_id?: number,
        @Query('rating') rating?: number,
        @Query('sort') sort?: 'rating' | 'created_at',
        @Query('order') order?: 'ASC' | 'DESC',
    ) {
        return this.reviewService.findAll({
            page,
            limit,
            product_id,
            rating,
            sort,
            order,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a review by ID' })
    @ApiParam({ name: 'id', description: 'ID of the review', type: Number })
    @ApiResponse({ status: 200, description: 'Review returned successfully' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new review' })
    @ApiBody({ type: CreateReviewDto })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    async create(
        @Body() createReviewDto: CreateReviewDto,
        @CurrentUser() user: User
    ) {
        return this.reviewService.create(user, createReviewDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update an existing review' })
    @ApiParam({ name: 'id', description: 'ID of the review to update', type: Number })
    @ApiBody({ type: UpdateReviewDto })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReviewDto: UpdateReviewDto,
        @CurrentUser() user: User
    ) {
        return this.reviewService.update(user, id, updateReviewDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete a review by ID' })
    @ApiParam({ name: 'id', description: 'ID of the review to delete', type: Number })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ) {
        return this.reviewService.remove(user, id);
    }

    // admin route
    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Admin: Get all reviews (full control)' })
    async adminFindAll(@Query() query: any) {
        return this.reviewService.adminFindAll(query);
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Admin: Get review by ID' })
    async adminFindOne(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.adminFindOne(id);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Admin: Delete any review' })
    async adminRemove(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.adminRemove(id);
    }

    @Put('admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Admin: Update any review' })
    async adminUpdate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewService.adminUpdate(id, dto);
    }
}