import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

@Entity('chat_messages')
export class ChatMessage {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'varchar', length: 20 })
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @Column()
  sessionId: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Helper method to get string ID
  get id(): string {
    return this._id.toHexString();
  }
}