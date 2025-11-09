import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { StaffAuthService } from './services/staff-auth.service';
import { StaffLoginDto } from './dto/staff-login.dto';
import { JwtStaffGuard } from './guards/jwt-staff.guard';
import { AuthenticatedStaff } from './interfaces/authenticated-staff.interface';

@Controller('auth/staff')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  /**
   * Staff login endpoint
   * POST /api/v1/auth/staff/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async staffLogin(@Body() loginDto: StaffLoginDto) {
    return this.staffAuthService.staffLogin(loginDto);
  }

  /**
   * Refresh token endpoint
   * POST /api/v1/auth/staff/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.staffAuthService.refreshToken(refreshToken);
  }

  /**
   * Get current staff profile (protected route)
   * GET /api/v1/auth/staff/me
   */
  @Get('me')
  @UseGuards(JwtStaffGuard)
  getProfile(@Request() req: { user: AuthenticatedStaff }) {
    return {
      user: req.user,
    };
  }
}
