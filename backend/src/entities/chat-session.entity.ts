import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('chat_sessions')
export class ChatSession {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to get string ID
  get id(): string {
    return this._id.toHexString();
  }
}