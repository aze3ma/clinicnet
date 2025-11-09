import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SmsProvider,
  SmsSendResult,
} from '../interfaces/sms-provider.interface';
import * as twilio from 'twilio';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: twilio.Twilio;
  private fromNumber?: string;

  constructor(private readonly config: ConfigService) {
    const accountSid = this.config.get<string>('twilio.accountSid');
    const authToken = this.config.get<string>('twilio.authToken');
    this.fromNumber = this.config.get<string>('twilio.phoneNumber');

    if (accountSid && authToken) {
      this.client = twilio.default(accountSid, authToken);
    }
  }

  async send(phone: string, message: string): Promise<SmsSendResult> {
    if (!this.client) {
      this.logger.warn('Twilio not configured, falling back to mock');
      return {
        success: false,
        error: 'Twilio not configured',
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phone,
      });

      this.logger.log(`SMS sent via Twilio: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Twilio error: ${errorMessage}`, errorStack);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  getProviderName(): string {
    return 'Twilio';
  }
}
