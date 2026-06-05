import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat_sessions.entity';
import { BaseEntity } from './base.entity';

export type ChatRole = 'user' | 'assistant';

export type ChatMessageType =
  | 'text'
  | 'products'
  | 'top_products'
  | 'categories'
  | 'reviews'
  | 'trending';

@Entity('chat_messages')
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: ChatRole;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  type: ChatMessageType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column()
  session_id: number;
}
