import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../common/cache/redis.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_TTL = 300; // 5 minutes in seconds
  private readonly OTP_PREFIX = 'otp:';
  private readonly OTP_ATTEMPTS_PREFIX = 'otp:attempts:';
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate a random 6-digit OTP
   */
  generateOtp(): string {
    // Use crypto for better randomness than Math.random()
    const randomNumber = crypto.randomInt(0, 999999);
    return randomNumber.toString().padStart(this.OTP_LENGTH, '0');
  }

  /**
   * Store OTP in Redis with expiration
   */
  async storeOtp(phone: string, otp: string): Promise<void> {
    const key = this.getOtpKey(phone);
    await this.redis.set(key, otp, this.OTP_TTL);
  }

  /**
   * Verify OTP
   */
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const key = this.getOtpKey(phone);
    const attemptsKey = this.getAttemptsKey(phone);

    // Check attempts
    const attempts = await this.redis.get(attemptsKey);
    if (attempts && parseInt(attempts) >= this.MAX_ATTEMPTS) {
      return false; // Too many attempts
    }

    // Get stored OTP
    const storedOtp = await this.redis.get(key);
    if (!storedOtp) {
      return false; // OTP expired or doesn't exist
    }

    // Increment attempts
    const currentAttempts = await this.redis.incr(attemptsKey);
    if (currentAttempts === 1) {
      // Set TTL on first attempt
      await this.redis.expire(attemptsKey, this.OTP_TTL);
    }

    // Verify OTP
    if (storedOtp === otp) {
      // Success - delete OTP and attempts
      await this.redis.del(key);
      await this.redis.del(attemptsKey);
      return true;
    }

    return false;
  }

  /**
   * Check if OTP exists for phone
   */
  async otpExists(phone: string): Promise<boolean> {
    const key = this.getOtpKey(phone);
    return this.redis.exists(key);
  }

  /**
   * Get remaining TTL for OTP
   */
  async getRemainingTtl(phone: string): Promise<number> {
    const key = this.getOtpKey(phone);
    return this.redis.ttl(key);
  }

  /**
   * Delete OTP (e.g., after successful verification)
   */
  async deleteOtp(phone: string): Promise<void> {
    const key = this.getOtpKey(phone);
    const attemptsKey = this.getAttemptsKey(phone);
    await this.redis.del(key);
    await this.redis.del(attemptsKey);
  }

  /**
   * Get OTP key for Redis
   */
  private getOtpKey(phone: string): string {
    return `${this.OTP_PREFIX}${phone}`;
  }

  /**
   * Get attempts key for Redis
   */
  private getAttemptsKey(phone: string): string {
    return `${this.OTP_ATTEMPTS_PREFIX}${phone}`;
  }
}
