import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { ChatSession } from './chat-session.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @ManyToOne(() => ChatSession, session => session.messages)
  session: ChatSession;

  @Column()
  sessionId: string;

  @ManyToOne(() => User, user => user.chatMessages)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}