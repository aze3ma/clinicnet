import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SmsProvider,
  SmsSendResult,
} from '../interfaces/sms-provider.interface';
import { MockSmsProvider } from '../providers/mock-sms.provider';
import { TwilioSmsProvider } from '../providers/twilio-sms.provider';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private provider: SmsProvider;

  constructor(
    private readonly config: ConfigService,
    private readonly mockProvider: MockSmsProvider,
    private readonly twilioProvider: TwilioSmsProvider,
  ) {
    // Select provider based on environment
    const providerName = this.config.get<string>('SMS_PROVIDER', 'mock');

    switch (providerName.toLowerCase()) {
      case 'twilio':
        this.provider = this.twilioProvider;
        break;
      case 'mock':
      default:
        this.provider = this.mockProvider;
        break;
    }

    this.logger.log(`Using SMS provider: ${this.provider.getProviderName()}`);
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const message = `Your ClinicNet verification code is: ${otp}. Valid for 5 minutes.`;
    return this.provider.send(phone, message);
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    phone: string,
    doctorName: string,
    appointmentTime: Date,
  ): Promise<SmsSendResult> {
    const message = `Reminder: Your appointment with Dr. ${doctorName} is at ${appointmentTime.toLocaleString()}`;
    return this.provider.send(phone, message);
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(
    phone: string,
    appointmentDetails: string,
  ): Promise<SmsSendResult> {
    const message = `Your appointment has been confirmed. ${appointmentDetails}`;
    return this.provider.send(phone, message);
  }
}
