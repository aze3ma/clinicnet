import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { StaffLoginDto } from '../dto/staff-login.dto';
import { StaffAuthResponseDto } from '../dto/staff-auth-response.dto';
import { StaffJwtPayload } from '../interfaces/staff-jwt-payload.interface';
import { PrismaService } from '../../../../common/database/prisma.service';

@Injectable()
export class StaffAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async staffLogin(loginDto: StaffLoginDto): Promise<StaffAuthResponseDto> {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.prisma.client.user.findUnique({
      where: { email },
      include: {
        clinic: true, // Include clinic data
      },
    });

    // 2. Check if user exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 5. Update last login
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 6. Generate tokens
    const payload: StaffJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      issuer: 'clinicnet',
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // 7. Return response
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinicId: user.clinicId,
      },
    };
  }

  /**
   * Generate access token (short-lived)
   */
  private generateAccessToken(payload: StaffJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Generate refresh token (long-lived)
   */
  private generateRefreshToken(payload: StaffJwtPayload): string {
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'CHANGE_ME_REFRESH';

    // Note: expiresIn is configured in the auth module registration
    return this.jwtService.sign(
      { userId: payload.userId },
      {
        secret: refreshSecret,
      },
    );
  }

  /**
   * Validate JWT payload
   */
  async validateUser(payload: StaffJwtPayload) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clinicId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<StaffJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Get user
      const user = await this.prisma.client.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const newPayload: StaffJwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        issuer: 'clinicnet',
      };

      const accessToken = this.generateAccessToken(newPayload);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
