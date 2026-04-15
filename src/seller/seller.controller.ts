import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '../auth/decorator/role-decorator';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Sellers')
@Controller('sellers')
export class SellerController {
    constructor(private readonly sellerService: SellerService) {}

    /** Become a seller */
    @Post('become')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Become a seller by providing store info' })
    @ApiResponse({ status: 201, description: 'Seller account created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input or user already a seller' })
    async becomeSeller(@Request() req, @Body() createSellerDto: CreateSellerDto) {
        return this.sellerService.becomeSeller(req.user, createSellerDto);
    }

    /** Get current user's seller info */
    @Get('me')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('seller')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current seller info of logged-in user' })
    @ApiResponse({ status: 200, description: 'Returns current seller info' })
    async getMyStore(@Request() req) {
        return this.sellerService.findOneByUser(req.user.id);
    }

    /** Update current seller info */
    @Put('me')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('seller')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update seller info for logged-in seller' })
    @ApiResponse({ status: 200, description: 'Seller info updated successfully' })
    async updateMyStore(@Request() req, @Body() updateSellerDto: UpdateSellerDto) {
        return this.sellerService.updateSeller(req.user, updateSellerDto);
    }

    /** Admin routes: Get all sellers */
    @Get('/admin')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get all sellers' })
    @ApiResponse({ status: 200, description: 'Returns list of all sellers' })
    async getAllSellers() {
        return this.sellerService.findAll();
    }

    /** Admin: Get seller by ID */
    @Get('/admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get seller by ID' })
    @ApiParam({ name: 'id', description: 'Seller UUID' })
    @ApiResponse({ status: 200, description: 'Returns seller info' })
    @ApiResponse({ status: 404, description: 'Seller not found' })
    async getSellerById(@Param('id', ParseUUIDPipe) id: string) {
        return this.sellerService.findOne(id);
    }

    /** Admin: Update seller by ID */
    @Put('/admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Update seller info by ID' })
    @ApiParam({ name: 'id', description: 'Seller UUID' })
    @ApiResponse({ status: 200, description: 'Seller info updated successfully' })
    async updateSellerByAdmin(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSellerDto: UpdateSellerDto,
    ) {
        return this.sellerService.updateSellerByAdmin(id, updateSellerDto);
    }

    /** Admin: Delete seller by ID */
    @Delete('/admin/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Delete seller by ID' })
    @ApiParam({ name: 'id', description: 'Seller UUID' })
    @ApiResponse({ status: 200, description: 'Seller deleted successfully' })
    @ApiResponse({ status: 404, description: 'Seller not found' })
    async deleteSeller(@Param('id', ParseUUIDPipe) id: string) {
        return this.sellerService.removeByAdmin(id);
    }
}