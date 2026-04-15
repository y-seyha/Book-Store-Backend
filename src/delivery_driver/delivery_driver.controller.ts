import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {DeliveryDriverService} from "./delivery_driver.service";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {RoleGuard} from "../auth/guard/role-guard.guard";
import {Roles} from "../auth/decorator/role-decorator";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {CreateDriverWithUserDto} from "./dto/create-driver.dto";

@Controller('admin/delivery-driver')
export class DeliveryDriverController {
    constructor(private readonly driverService : DeliveryDriverService) {
    }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create driver with user account' })
    @ApiResponse({ status: 201, description: 'Driver created successfully' })
    async create(@Body() createDriverDto: CreateDriverWithUserDto) {
        return this.driverService.createDriver(createDriverDto);
    }


    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get all drivers' })
    @ApiResponse({ status: 200, description: 'List of drivers' })
    async findAll() {
        return this.driverService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get driver by ID' })
    @ApiParam({ name: 'id', description: 'Driver ID', type: Number })
    @ApiResponse({ status: 200, description: 'Driver detail' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.driverService.findOne(id);
    }


    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update driver info' })
    @ApiParam({ name: 'id', description: 'Driver ID', type: Number })
    @ApiResponse({ status: 200, description: 'Driver updated successfully' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: any
    ) {
        return this.driverService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete driver' })
    @ApiParam({ name: 'id', description: 'Driver ID', type: Number })
    @ApiResponse({ status: 200, description: 'Driver deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.driverService.remove(id);
    }
}
