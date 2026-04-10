import {Injectable, Logger} from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import {InjectRepository} from "@nestjs/typeorm";
import {ContactMessage} from "../common/entities/contact-message.entity";
import {Repository} from "typeorm";
import {CreateContactDto} from "./dto/create-contact.dto";


@Injectable()
export class ContactService {
    private bot: TelegramBot;
    private readonly logger = new Logger(ContactService.name);

    constructor(
        @InjectRepository(ContactMessage)
        private contactRepo: Repository<ContactMessage>,
    ) {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
    }

    async  sendContactMessage(createContactDto: CreateContactDto) {
        const{name, email, subject, message} = createContactDto;

        const contactMessage = this.contactRepo.create({ name, email, subject, message });
        await this.contactRepo.save(contactMessage);

        const chatId = process.env.TELEGRAM_CHAT_ID;
        const text = `📩 *New Contact Message*\n
                        *Name:* ${name}
                        *Email:* ${email}
                        *Subject:* ${subject}
                        *Message:* ${message}`;

        if (!chatId) {
            throw new Error('TELEGRAM_CHAT_ID environment variable is not set');
        }

        try{
            await this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

            contactMessage.sent_to_telegram = true;
            await this.contactRepo.save(contactMessage);

            this.logger.log(`Message sent to Telegram: ${name} - ${email}`);
            return { success: true, message: 'Message sent successfully' };
        }catch(error){
            this.logger.error('Failed to send Telegram message', error);
            return { success: false, message: 'Message saved but Telegram failed', error };
        }
    }




}
