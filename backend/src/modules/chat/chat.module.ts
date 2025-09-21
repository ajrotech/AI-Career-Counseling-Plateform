import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AIService } from './ai.service';
import { ChatGateway } from './chat.gateway';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage, User]),
  ],
  controllers: [ChatController],
  providers: [ChatService, AIService, ChatGateway],
  exports: [ChatService, AIService],
})
export class ChatModule {}