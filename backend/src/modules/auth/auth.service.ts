import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';

// DTOs
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// Response types
import { AuthResponse } from './interfaces/auth-response.interface';
import { UserPayload } from './interfaces/user-payload.interface';

@Injectable()
export class AuthService {
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, username, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username is already taken');
      }
    }

    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();

      // Generate unique username if not provided
      let finalUsername = username;
      if (!finalUsername) {
        // Generate username from email (part before @) + random suffix
        const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        finalUsername = `${emailPrefix}_${randomSuffix}`;
        
        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 5) {
          const existingWithUsername = await this.userRepository.findOne({
            where: { username: finalUsername },
          });
          if (!existingWithUsername) break;
          
          const newRandomSuffix = Math.random().toString(36).substring(2, 8);
          finalUsername = `${emailPrefix}_${newRandomSuffix}`;
          attempts++;
        }
      }

      // Create user
      const user = this.userRepository.create({
        email,
        username: finalUsername,
        password: passwordHash,
        role: role || 'student',
        emailVerificationToken,
        isActive: true, // Set to true for testing purposes (normally activated via email verification)
        emailVerified: false, // Will be set to true when email is verified
      });

      const savedUser = await this.userRepository.save(user);

      // Create user profile (temporarily disabled for testing)
      // const profile = this.userProfileRepository.create({
      //   user: savedUser,
      //   firstName,
      //   lastName,
      // });
      // await this.userProfileRepository.save(profile);

      // Send verification email (temporarily disabled for testing)
      // await this.emailService.sendEmailVerification(
      //   savedUser,
      //   savedUser.emailVerificationToken,
      // );

      // Generate tokens
      const payload: UserPayload = {
        userId: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      };

      const { accessToken, refreshToken } = this.tokenService.generateTokens(savedUser);

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          username: savedUser.username,
          role: savedUser.role,
          isActive: savedUser.isActive,
          emailVerified: savedUser.emailVerified,
          profile: {
            firstName,
            lastName,
          },
        },
        accessToken,
        refreshToken,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException(`Failed to create user account: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with profile
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new UnauthorizedException('Account is temporarily locked due to too many failed attempts');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.handleSuccessfulLogin(user);

    // Generate tokens
    const { accessToken, refreshToken } = this.tokenService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        } : null,
      },
      accessToken,
      refreshToken,
      message: 'Login successful',
    };
  }

  async googleAuth(googleUser: any): Promise<AuthResponse> {
    let user = await this.userRepository.findOne({
      where: { email: googleUser.email },
      relations: ['profile'],
    });

    if (!user) {
      // Create new user from Google profile
      user = this.userRepository.create({
        email: googleUser.email,
        username: googleUser.email.split('@')[0],
        role: 'student',
        emailVerified: true,
      });
      
      // Set OAuth providers using helper method
      user.setOAuthProviders(['google']);

      const savedUser = await this.userRepository.save(user);

      // Create profile
      const profile = this.userProfileRepository.create({
        user: savedUser,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        profilePicture: googleUser.picture,
      });

      await this.userProfileRepository.save(profile);
      user.profile = profile;
    } else {
      // Update OAuth providers if not already included
      const providers = user.getOAuthProviders();
      if (!providers.includes('google')) {
        providers.push('google');
        user.setOAuthProviders(providers);
        await this.userRepository.save(user);
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.tokenService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        } : null,
      },
      accessToken,
      refreshToken,
      message: 'Google authentication successful',
    };
  }

  async linkedinAuth(linkedinUser: any): Promise<AuthResponse> {
    let user = await this.userRepository.findOne({
      where: { email: linkedinUser.email },
      relations: ['profile'],
    });

    if (!user) {
      // Create new user from LinkedIn profile
      user = this.userRepository.create({
        email: linkedinUser.email,
        username: linkedinUser.email.split('@')[0],
        role: 'student',
        emailVerified: true,
      });
      
      // Set OAuth providers using helper method
      user.setOAuthProviders(['linkedin']);

      const savedUser = await this.userRepository.save(user);

      // Create profile
      const profile = this.userProfileRepository.create({
        user: savedUser,
        firstName: linkedinUser.firstName,
        lastName: linkedinUser.lastName,
        profilePicture: linkedinUser.picture,
      });

      await this.userProfileRepository.save(profile);
      user.profile = profile;
    } else {
      // Update OAuth providers if not already included
      const providers = user.getOAuthProviders();
      if (!providers.includes('linkedin')) {
        providers.push('linkedin');
        user.setOAuthProviders(providers);
        await this.userRepository.save(user);
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.tokenService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        } : null,
      },
      accessToken,
      refreshToken,
      message: 'LinkedIn authentication successful',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal whether email exists or not
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpiresAt;

    await this.userRepository.save(user);

    // Send reset email
    await this.emailService.sendPasswordReset(user, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user
    user.password = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.loginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    user.password = passwordHash;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;

    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      
      // Get the user from the database
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub } 
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      const newAccessToken = this.tokenService.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // In a production environment, you might want to blacklist the tokens
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.loginAttempts += 1;

    if (user.loginAttempts >= this.maxLoginAttempts) {
      user.lockedUntil = new Date(Date.now() + this.lockoutDuration);
    }

    await this.userRepository.save(user);
  }

  private async handleSuccessfulLogin(user: User): Promise<void> {
    user.loginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();

    await this.userRepository.save(user);
  }
}