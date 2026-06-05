import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatbotDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
