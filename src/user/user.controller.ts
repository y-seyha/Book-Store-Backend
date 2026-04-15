import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards, Post,
} from '@nestjs/common';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { Roles } from '../auth/decorator/role-decorator';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse, ApiBody,
} from '@nestjs/swagger';
import {UserService} from "./user.service";
import {CreateUserDto} from "./dto/create-user-dto";

@ApiTags('Users (Admin)')
@ApiBearerAuth()
@Controller('admin/users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'List of users' })
    async findAll(@Query() query: QueryUserDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: String })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update user info' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto);
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Change user role' })
    async changeRole(
        @Param('id') id: string,
        @Body('role') role: 'admin' | 'customer' | 'seller' | 'driver',
    ) {
        return this.usersService.changeRole(id, role);
    }

    @Patch(':id/verify')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Verify user email' })
    async verifyUser(@Param('id') id: string) {
        return this.usersService.verifyUser(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete user' })
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create new user (Admin)' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
}