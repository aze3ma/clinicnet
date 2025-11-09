import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../common/cache/redis.service';

@Injectable()
export class RateLimiterService {
  private readonly RATE_LIMIT_PREFIX = 'rate:otp:';
  private readonly MAX_REQUESTS = 3; // Max 3 OTP requests
  private readonly WINDOW = 3600; // 1 hour window (in seconds)
  private readonly COOLDOWN_PREFIX = 'cooldown:otp:';
  private readonly COOLDOWN_DURATION = 60; // 60 seconds between requests

  constructor(private readonly redis: RedisService) {}

  /**
   * Check if phone number is rate limited
   * Returns: { allowed: boolean, remaining: number, resetAt: Date }
   */
  async checkRateLimit(phone: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date | null;
  }> {
    const key = this.getRateLimitKey(phone);

    // Get current count
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= this.MAX_REQUESTS) {
      // Rate limited
      const ttl = await this.redis.ttl(key);
      const resetAt = new Date(Date.now() + ttl * 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: this.MAX_REQUESTS - count - 1,
      resetAt: null,
    };
  }

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(phone: string): Promise<void> {
    const key = this.getRateLimitKey(phone);

    const count = await this.redis.incr(key);

    // Set expiration on first request
    if (count === 1) {
      await this.redis.expire(key, this.WINDOW);
    }
  }

  /**
   * Check cooldown (time between consecutive requests)
   */
  async checkCooldown(phone: string): Promise<{
    allowed: boolean;
    remainingSeconds: number;
  }> {
    const key = this.getCooldownKey(phone);
    const exists = await this.redis.exists(key);

    if (exists) {
      const ttl = await this.redis.ttl(key);
      return {
        allowed: false,
        remainingSeconds: ttl,
      };
    }

    return {
      allowed: true,
      remainingSeconds: 0,
    };
  }

  /**
   * Set cooldown for phone number
   */
  async setCooldown(phone: string): Promise<void> {
    const key = this.getCooldownKey(phone);
    await this.redis.set(key, '1', this.COOLDOWN_DURATION);
  }

  /**
   * Reset rate limit for phone (admin action)
   */
  async resetRateLimit(phone: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(phone);
    const cooldownKey = this.getCooldownKey(phone);

    await this.redis.del(rateLimitKey);
    await this.redis.del(cooldownKey);
  }

  private getRateLimitKey(phone: string): string {
    return `${this.RATE_LIMIT_PREFIX}${phone}`;
  }

  private getCooldownKey(phone: string): string {
    return `${this.COOLDOWN_PREFIX}${phone}`;
  }
}
