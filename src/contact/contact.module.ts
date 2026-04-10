import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import {ContactMessage} from "../common/entities/contact-message.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}