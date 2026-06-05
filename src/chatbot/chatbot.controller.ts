import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { ChatbotService } from './chatbot.service';
import { ChatbotDto } from './dto/chatbot.dto';

import { User } from '../common/entities/user.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@ApiTags('Chatbot')
@ApiBearerAuth()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with AI bookstore assistant' })
  @ApiBody({ type: ChatbotDto })
  @ApiResponse({
    status: 200,
    description: 'AI response returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async chat(@CurrentUser() user: User, @Body() dto: ChatbotDto) {
    const response = await this.chatbotService.chat(user, dto.message);

    return {
      success: true,
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user chat history',
  })
  async getChatHistory(@CurrentUser() user: User) {
    const response = await this.chatbotService.getChat(user);

    return {
      success: true,
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }
}
