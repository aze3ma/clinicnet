import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/database/prisma.service';
import { OTPService } from './otp.service';
import { SmsService } from './sms.service';
import { RateLimiterService } from './rate-limiter.service';
import { PhoneUtil } from '../../../../common/utils/phone.util';
import { OTPRequestDto } from '../dto/otp-request.dto';
import { OTPVerifyDto } from '../dto/otp-verify.dto';
import { PatientJwtPayload } from '../interfaces/patient-jwt-payload.interface';

@Injectable()
export class PatientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OTPService,
    private readonly smsService: SmsService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  /**
   * Request OTP for phone number
   */
  async requestOtp(
    dto: OTPRequestDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clinicId: string,
  ): Promise<{
    message: string;
    expiresIn: number;
    cooldownSeconds?: number;
  }> {
    // Normalize phone number
    const phone = PhoneUtil.normalize(dto.phone);
    if (!phone) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check cooldown
    const cooldown = await this.rateLimiter.checkCooldown(phone);
    if (!cooldown.allowed) {
      throw new BadRequestException(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting another OTP`,
      );
    }

    // Check rate limit
    const rateLimit = await this.rateLimiter.checkRateLimit(phone);
    if (!rateLimit.allowed) {
      throw new BadRequestException(
        `Too many OTP requests. Try again after ${rateLimit.resetAt!.toLocaleTimeString()}`,
      );
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();

    // Store in Redis
    await this.otpService.storeOtp(phone, otp);

    // Send SMS
    const smsResult = await this.smsService.sendOtp(phone, otp);

    if (!smsResult.success) {
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    // Increment rate limit and set cooldown
    await this.rateLimiter.incrementRateLimit(phone);
    await this.rateLimiter.setCooldown(phone);

    return {
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes
      cooldownSeconds: 60,
    };
  }

  /**
   * Verify OTP and return JWT tokens
   */
  async verifyOtp(
    dto: OTPVerifyDto,
    clinicId: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    patient: {
      id: string;
      phone: string;
      firstName: string | null;
      lastName: string | null;
    };
    isNewPatient: boolean;
  }> {
    // Normalize phone number
    const phone = PhoneUtil.normalize(dto.phone);
    if (!phone) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(phone, dto.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create patient
    let patient = await this.prisma.client.patient.findUnique({
      where: {
        clinicId_phone: {
          clinicId,
          phone,
        },
      },
    });

    const isNewPatient = !patient;

    if (!patient) {
      // Create new patient with minimal info
      patient = await this.prisma.client.patient.create({
        data: {
          clinicId,
          phone,
          firstName: 'Patient', // Will be updated later
          lastName: phone.slice(-4), // Temporary
        },
      });
    }

    // Generate JWT tokens
    const payload: PatientJwtPayload = {
      userId: patient.id,
      email: patient.phone, // Using phone as identifier
      role: 'PATIENT',
      clinicId: patient.clinicId,
      issuer: 'clinicnet',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { userId: patient.id },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    return {
      accessToken,
      refreshToken,
      patient: {
        id: patient.id,
        phone: patient.phone,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      isNewPatient,
    };
  }
}
