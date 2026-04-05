import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorator/role-decorator';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('File Upload')
@ApiBearerAuth()
@Controller('file-upload')
export class FileUploadController {
    constructor(private fileUploadService: FileUploadService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file with optional description' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload payload',
        type: UploadFileDto,
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadFileDto: UploadFileDto,
        @CurrentUser() user: User,
    ): Promise<any> {
        if (!file) throw new BadRequestException('File is required');
        return this.fileUploadService.uploadFile(file, uploadFileDto.description, user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List all uploaded files' })
    @ApiResponse({ status: 200, description: 'Returns list of uploaded files' })
    async findAll() {
        return this.fileUploadService.findAll();
    }

    @Delete(':id')
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @ApiOperation({ summary: 'Delete a file by ID (Admin only)' })
    @ApiParam({ name: 'id', description: 'UUID of the file to delete', type: String })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.fileUploadService.remove(id);
        return {
            message: 'File deleted successfully',
        };
    }
}