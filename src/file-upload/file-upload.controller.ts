import {
    BadRequestException,
    Body,
    Controller, Delete,
    Get, Param, ParseUUIDPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FileUploadService} from "./file-upload.service";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {CurrentUser} from "../auth/decorator/current-user.decorator";
import {User} from '../common/entities/user.entity'
import {UploadFileDto} from "./upload-file.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {Roles} from "../auth/decorator/role-decorator";
import {RoleGuard} from "../auth/guard/role-guard.guard";

@Controller('file-upload')
export class FileUploadController {
    constructor(private fileUploadService : FileUploadService) {
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadFileDto: UploadFileDto,
        @CurrentUser() user: User,
    ): Promise<any> {
        if (!file) throw new BadRequestException('File is required');
        console.log(file);

        return this.fileUploadService.uploadFile(
            file,
            uploadFileDto.description,
            user,
        );
    }

    @Get()
    async findAll() {
        return this.fileUploadService.findAll();
    }

    @Delete(':id')
    // @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RoleGuard)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.fileUploadService.remove(id);
        return {
            messsage: 'File deleted successfully',
        };
    }
}
