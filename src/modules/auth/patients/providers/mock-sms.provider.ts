import { Injectable, Logger } from '@nestjs/common';
import {
  SmsProvider,
  SmsSendResult,
} from '../interfaces/sms-provider.interface';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async send(phone: string, message: string): Promise<SmsSendResult> {
    // Simulate network delay
    await this.sleep(500);

    // Log to console (in development, you'd see this)
    this.logger.log(`📱 SMS to ${phone}: ${message}`);

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: 'Simulated delivery failure',
      };
    }
  }

  getProviderName(): string {
    return 'Mock SMS Provider';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
