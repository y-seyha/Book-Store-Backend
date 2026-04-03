import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CloudinaryModule} from "./cloudinary/cloudinary.module";
import {MulterModule} from "@nestjs/platform-express";
import {memoryStorage} from "multer";
import {File} from "../common/entities/file-upload.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([File]),
      CloudinaryModule,
      MulterModule.register({
        storage : memoryStorage(),
      })
  ],
  providers: [FileUploadService],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
