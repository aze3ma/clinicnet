export interface SmsProvider {
  /**
   * Send SMS to phone number
   * @param phone - Phone number in E.164 format
   * @param message - SMS message content
   * @returns Promise with send result
   */
  send(phone: string, message: string): Promise<SmsSendResult>;

  /**
   * Get provider name
   */
  getProviderName(): string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
