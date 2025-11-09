import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientAuthService } from './services/patient-auth.service';
import { PatientAuthController } from './patient-auth.controller';
import { JwtPatientStrategy } from './strategies/jwt-patient.strategy';
import { OTPService } from './services/otp.service';
import { SmsService } from './services/sms.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { JwtConfigFactory } from '../shared/config/jwt-config.factory';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-patient' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        JwtConfigFactory.createJwtOptions(configService),
    }),
  ],
  controllers: [PatientAuthController],
  providers: [
    PatientAuthService,
    JwtPatientStrategy,
    OTPService,
    SmsService,
    RateLimiterService,
    MockSmsProvider,
    TwilioSmsProvider,
  ],
  exports: [PatientAuthService, JwtPatientStrategy, PassportModule, JwtModule],
})
export class PatientAuthModule {}
