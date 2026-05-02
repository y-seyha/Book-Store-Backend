import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { ProfileService } from './profile.service';
import {UpdateProfileDto} from "./dto/updateProfile.dto";

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Patch('me')
    @ApiOperation({ summary: 'Update my profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    updateMyProfile(
        @CurrentUser() user: any,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.profileService.updateMyProfile(user.id, dto);
    }
}