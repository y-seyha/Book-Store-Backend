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

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    // GET /reviews?product_id=1&rating=5&page=1&limit=10&sort=rating&order=DESC
    @Get()
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
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() createReviewDto: CreateReviewDto,
        @CurrentUser() user: User
    ) {
        return this.reviewService.create(user, createReviewDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReviewDto: UpdateReviewDto,
        @CurrentUser() user: User
    ) {
        return this.reviewService.update(user, id, updateReviewDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ) {
        return this.reviewService.remove(user, id);
    }
}