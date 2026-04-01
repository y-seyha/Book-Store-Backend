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

@Controller('sellers')
export class SellerController {
    constructor(private readonly sellerService: SellerService) {}

    // Become a seller
    @Post('become')
    @UseGuards(JwtAuthGuard)
    async becomeSeller(@Request() req, @Body() createSellerDto: CreateSellerDto) {
        return this.sellerService.becomeSeller(req.user, createSellerDto);
    }

    // Get current user's seller info
    @Get('me')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('seller')
    async getMyStore(@Request() req) {
        return this.sellerService.findOneByUser(req.user.id);
    }

    // Update current seller
    @Put('me')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('seller')
    async updateMyStore(@Request() req, @Body() updateSellerDto: UpdateSellerDto) {
        return this.sellerService.updateSeller(req.user, updateSellerDto);
    }

    // Admin routes for all sellers
    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    async getAllSellers() {
        return this.sellerService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    async getSellerById(@Param('id', ParseUUIDPipe) id: string) {
        return this.sellerService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    async updateSellerByAdmin(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSellerDto: UpdateSellerDto,
    ) {
        return this.sellerService.updateSellerByAdmin(id, updateSellerDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    async deleteSeller(@Param('id', ParseUUIDPipe) id: string) {
        return this.sellerService.removeByAdmin(id);
    }
}