import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../../../entities/user.entity';
import { BookingDetails, PaymentDetails } from '../interfaces/email.interfaces';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@localhost'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Log the email attempt but don't throw error in development
      console.log(`Email would have been sent - Subject: ${options.subject}, To: ${options.to}`);
    }
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = `
      <h1>Welcome to Career Counseling Platform!</h1>
      <p>Hello ${user.profile?.firstName || user.email},</p>
      <p>Thank you for joining our platform. We're excited to help you on your career journey!</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your profile</li>
        <li>Taking our career assessment</li>
        <li>Exploring personalized roadmaps</li>
        <li>Connecting with mentors</li>
      </ul>
      <p>Best regards,<br>The Career Counseling Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Career Counseling Platform!',
      html,
    });
  }

  async sendEmailVerification(user: User, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    
    const html = `
      <h1>Verify Your Email Address</h1>
      <p>Hello ${user.profile?.firstName || user.email},</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Career Counseling Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendPasswordReset(user: User, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    
    const html = `
      <h1>Reset Your Password</h1>
      <p>Hello ${user.profile?.firstName || user.email},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Career Counseling Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html,
    });
  }

  async sendBookingConfirmation(user: User, bookingDetails: BookingDetails): Promise<void> {
    const html = `
      <h1>Booking Confirmation</h1>
      <p>Hello ${user.profile?.firstName || user.email},</p>
      <p>Your mentoring session has been confirmed!</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
        <li><strong>Duration:</strong> ${bookingDetails.duration} minutes</li>
        <li><strong>Mentor:</strong> ${bookingDetails.mentorName}</li>
        <li><strong>Type:</strong> ${bookingDetails.type}</li>
      </ul>
      <p>We'll send you a reminder before your session.</p>
      <p>Best regards,<br>The Career Counseling Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Booking Confirmation - Career Counseling Platform',
      html,
    });
  }

  async sendPaymentConfirmation(user: User, paymentDetails: PaymentDetails): Promise<void> {
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Hello ${user.profile?.firstName || user.email},</p>
      <p>Thank you for your payment!</p>
      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Amount:</strong> $${paymentDetails.amount}</li>
        <li><strong>Service:</strong> ${paymentDetails.service}</li>
        <li><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</li>
        <li><strong>Date:</strong> ${paymentDetails.date}</li>
      </ul>
      <p>Your receipt is attached to this email.</p>
      <p>Best regards,<br>The Career Counseling Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Payment Confirmation - Career Counseling Platform',
      html,
    });
  }
}