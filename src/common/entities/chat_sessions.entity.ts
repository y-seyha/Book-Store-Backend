import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ChatMessage } from './chat-message.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('chat_sessions')
export class ChatSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string; // MUST match User.id type

  @OneToMany(() => ChatMessage, (msg) => msg.session, {
    cascade: true,
  })
  messages: ChatMessage[];
}
