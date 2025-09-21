import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateAssessmentSubmissionDto } from './dto/create-assessment-submission.dto';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available assessments' })
  @ApiResponse({ status: 200, description: 'Return all assessments' })
  async getAvailableAssessments() {
    try {
      const assessments = await this.assessmentsService.getAvailableAssessments();
      return {
        success: true,
        data: assessments,
        message: 'Assessments retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve assessments',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  @ApiResponse({ status: 200, description: 'Return assessment with questions' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async getAssessmentById(@Param('id') id: string) {
    try {
      const assessment = await this.assessmentsService.getAssessmentById(id);
      if (!assessment) {
        throw new HttpException(
          {
            success: false,
            message: 'Assessment not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: assessment,
        message: 'Assessment retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve assessment',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit assessment responses' })
  @ApiResponse({ status: 201, description: 'Assessment submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid submission data' })
  async submitAssessment(
    @Body() submissionDto: CreateAssessmentSubmissionDto,
    @GetUser() user: User,
  ) {
    try {
      const result = await this.assessmentsService.submitAssessment(
        submissionDto,
        user.id,
      );
      return {
        success: true,
        data: result,
        message: 'Assessment submitted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to submit assessment',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('history/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user assessment history' })
  @ApiResponse({ status: 200, description: 'Return user assessment history' })
  async getUserAssessmentHistory(@GetUser() user: User) {
    try {
      const history = await this.assessmentsService.getUserAssessmentHistory(
        user.id,
      );
      return {
        success: true,
        data: history,
        message: 'Assessment history retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve assessment history',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('result/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assessment result by ID' })
  @ApiResponse({ status: 200, description: 'Return assessment result' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async getAssessmentResult(
    @Param('resultId') resultId: string,
    @GetUser() user: User,
  ) {
    try {
      const result = await this.assessmentsService.getAssessmentResult(
        resultId,
        user.id,
      );
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Assessment result not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: result,
        message: 'Assessment result retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve assessment result',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}