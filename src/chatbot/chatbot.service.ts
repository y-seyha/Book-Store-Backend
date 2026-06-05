import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatbotContextService } from './chatbot-context.service';
import { ChatSession } from '../common/entities/chat_sessions.entity';
import { ChatMessage } from '../common/entities/chat-message.entity';
import { User } from '../common/entities/user.entity';

export interface ChatbotResponse {
  type:
    | 'text'
    | 'products'
    | 'top_products'
    | 'categories'
    | 'reviews'
    | 'trending';
  title: string;
  message: string;
  data?: any[];
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly apiKey = process.env.GROQ_API_KEY;

  constructor(
    private readonly contextService: ChatbotContextService,

    @InjectRepository(ChatSession)
    private readonly sessionRepo: Repository<ChatSession>,

    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
  ) {}

  async chat(user: User, message: string): Promise<ChatbotResponse> {
    try {
      this.logger.log(`User: ${user.id} | Message: ${message}`);

      let session = await this.sessionRepo.findOne({
        where: { user_id: user.id },
      });

      if (!session) {
        session = await this.sessionRepo.save({
          user_id: user.id,
        });
      }

      await this.messageRepo.save({
        session: { id: session.id },
        role: 'user',
        content: message,
        type: 'text',
      });

      //  Build context
      const context = await this.contextService.buildContext(message);
      const intent = this.detectIntent(message);

      let response: ChatbotResponse;

      switch (intent) {
        case 'products':
          response = {
            type: 'products',
            title: 'Products',
            message: `Found ${context.products.length} products`,
            data: context.products,
          };
          break;

        case 'top':
          response = {
            type: 'top_products',
            title: 'Top Products',
            message: 'Top selling products',
            data: context.trending,
          };
          break;

        case 'categories':
          response = {
            type: 'categories',
            title: 'Categories',
            message: 'Available categories',
            data: context.categories,
          };
          break;

        case 'reviews':
          response = {
            type: 'reviews',
            title: 'Reviews',
            message: 'Latest reviews',
            data: context.reviews,
          };
          break;

        default:
          response = {
            type: 'text',
            title: 'Assistant',
            message: await this.generateAIResponse(message, context),
          };
      }

      await this.messageRepo.save({
        session: { id: session.id },
        role: 'assistant',
        content: response.message,
        type: response.type,
        metadata: response.data,
      });

      return response;
    } catch (err) {
      this.logger.error(err);

      return {
        type: 'text',
        title: 'Error',
        message: 'Service temporarily unavailable',
      };
    }
  }

  async getChat(user: User) {
    const session = await this.sessionRepo.findOne({
      where: { user_id: user.id },
    });

    if (!session) {
      return {
        type: 'text',
        title: 'Chat History',
        message: 'No chat history found',
        data: [],
      };
    }

    const messages = await this.messageRepo.find({
      where: { session: { id: session.id } },
      order: { created_at: 'ASC' },
    });

    return {
      type: 'text',
      title: 'Chat History',
      message: 'Chat loaded successfully',
      data: messages.map((m) => ({
        role: m.role,
        content: m.content,
        type: m.type,

        data: Array.isArray(m.metadata) ? m.metadata : [],
      })),
    };
  }

  private detectIntent(message: string) {
    const m = message.toLowerCase();

    if (m.includes('list') || m.includes('show') || m.includes('products'))
      return 'products';

    if (m.includes('top') || m.includes('best')) return 'top';

    if (m.includes('category')) return 'categories';

    if (m.includes('review')) return 'reviews';

    return 'chat';
  }

  private async generateAIResponse(message: string, context: any) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a bookstore assistant. Use only provided data.',
          },
          {
            role: 'user',
            content: `DATA: ${JSON.stringify(context)} \nQUESTION: ${message}`,
          },
        ],
      }),
    });

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };

    return data.choices?.[0]?.message?.content ?? 'No response';
  }
}
