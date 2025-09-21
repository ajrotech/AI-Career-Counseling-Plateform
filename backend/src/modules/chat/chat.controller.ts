import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateSessionDto } from './dto/chat.dto';
import { CareerRoadmapPreferencesDto } from './dto/career-roadmap.dto';
import { User } from '../../entities/user.entity';
import { RateLimitGuard } from '../../guards/rate-limit.guard';
import { GetOptionalUser } from '../auth/decorators/get-optional-user.decorator';

@ApiTags('chat')
@Controller('chat')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Helper method to get user ID with fallback to demo user for development
   * In production, authentication should be required for all endpoints
   */
  private async getUserId(optionalUser?: User): Promise<string> {
    console.log('🔍 [CHAT CONTROLLER] Getting user ID...');
    
    if (optionalUser?.id) {
      console.log('✅ [CHAT CONTROLLER] Using authenticated user ID:', optionalUser.id);
      return optionalUser.id;
    }
    
    console.log('⚠️ [CHAT CONTROLLER] No authenticated user, using demo user');
    // Fallback for demo/development mode
    const demoUserId = await this.ensureDemoUser();
    console.log('🎭 [CHAT CONTROLLER] Demo user ID:', demoUserId);
    return demoUserId;
  }
  private async ensureDemoUser(): Promise<string> {
    const demoUserId = 'demo-user-id';
    const existingUser = await this.userRepository.findOne({ where: { id: demoUserId } });
    
    if (!existingUser) {
      const demoUser = this.userRepository.create({
        id: demoUserId,
        email: 'demo@example.com',
        username: 'demo_user',
        role: 'student',
        emailVerified: true,
        isActive: true,
      });
      await this.userRepository.save(demoUser);
    }
    
    return demoUserId;
  }

  @Post('message')
  @UseGuards(RateLimitGuard.forChat())
  @ApiOperation({ summary: 'Send a chat message to AI assistant' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto, 
    @GetOptionalUser() user?: User
  ) {
    console.log('🚀 [CHAT CONTROLLER] POST /chat/message - Request received');
    console.log('📝 [CHAT CONTROLLER] Message DTO:', JSON.stringify(sendMessageDto, null, 2));
    console.log('👤 [CHAT CONTROLLER] User:', user ? `ID: ${user.id}, Email: ${user.email}` : 'No user (demo mode)');
    
    try {
      const userId = await this.getUserId(user);
      console.log('🔑 [CHAT CONTROLLER] Using userId:', userId);
      
      const result = await this.chatService.sendMessage(userId, sendMessageDto);
      console.log('✅ [CHAT CONTROLLER] Message sent successfully');
      console.log('📤 [CHAT CONTROLLER] Response:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('❌ [CHAT CONTROLLER] Error sending message:', error);
      console.error('❌ [CHAT CONTROLLER] Error stack:', error.stack);
      
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('sessions')
  async getSessions(@GetOptionalUser() user?: User) {
    console.log('🚀 [CHAT CONTROLLER] GET /chat/sessions - Request received');
    console.log('👤 [CHAT CONTROLLER] User:', user ? `ID: ${user.id}` : 'No user (demo mode)');
    
    const userId = await this.getUserId(user);
    console.log('🔑 [CHAT CONTROLLER] Using userId:', userId);
    
    const sessions = await this.chatService.getUserSessions(userId);
    console.log('📋 [CHAT CONTROLLER] Found', sessions.length, 'sessions');
    
    return sessions;
  }

  @Post('sessions')
  async createSession(
    @Body() createSessionDto: CreateSessionDto, 
    @GetOptionalUser() user?: User
  ) {
    const userId = await this.getUserId(user);
    return this.chatService.createSession(userId, createSessionDto);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific chat session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(
    @Param('id') sessionId: string, 
    @GetOptionalUser() user?: User
  ) {
    console.log('🚀 [CHAT CONTROLLER] GET /chat/sessions/:id - Request received');
    console.log('🔑 [CHAT CONTROLLER] Session ID:', sessionId);
    console.log('👤 [CHAT CONTROLLER] User:', user ? `ID: ${user.id}` : 'No user (demo mode)');
    
    const userId = await this.getUserId(user);
    console.log('🔑 [CHAT CONTROLLER] Using userId:', userId);
    
    const session = await this.chatService.getSession(sessionId, userId);
    console.log('📋 [CHAT CONTROLLER] Session found:', session ? 'Yes' : 'No');
    
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    
    return session;
  }

  @Get('sessions/:id/messages')
  async getSessionMessages(
    @Param('id') sessionId: string, 
    @GetOptionalUser() user?: User
  ) {
    const userId = await this.getUserId(user);
    return this.chatService.getSessionMessages(sessionId, userId);
  }

  @Delete('sessions/:id')
  async deleteSession(
    @Param('id') sessionId: string, 
    @GetOptionalUser() user?: User
  ) {
    const userId = await this.getUserId(user);
    await this.chatService.deleteSession(sessionId, userId);
    return { success: true };
  }

  @Post('analyze-document')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeDocument(
    @UploadedFile() file: Express.Multer.File,
    @GetOptionalUser() user?: User
  ) {
    const userId = await this.getUserId(user);
    
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const fileContent = file.buffer.toString('utf-8');
    const analysis = await this.chatService.analyzeDocument(userId, fileContent, file.originalname);
    
    return { analysis };
  }

  @Post('career-roadmap')
  async generateCareerRoadmap(
    @Body() preferences: CareerRoadmapPreferencesDto, 
    @GetOptionalUser() user?: User
  ) {
    const userId = await this.getUserId(user);
    return this.chatService.generateCareerRoadmap(userId, preferences);
  }
}