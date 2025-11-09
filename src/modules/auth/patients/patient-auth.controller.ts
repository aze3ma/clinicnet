import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { PatientAuthService } from './services/patient-auth.service';
import { OTPRequestDto } from './dto/otp-request.dto';
import { OTPVerifyDto } from './dto/otp-verify.dto';
import { JwtPatientGuard } from './guards/jwt-patient.guard';
import { AuthenticatedPatient } from './interfaces/authenticated-patient.interface';

@Controller('auth/patients')
export class PatientAuthController {
  constructor(private readonly patientAuthService: PatientAuthService) {}

  /**
   * Request OTP for patient login
   * POST /api/v1/auth/patients/otp/request
   */
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(
    @Body() dto: OTPRequestDto,
    @Headers('x-clinic-id') clinicId?: string,
  ) {
    // In a real app, clinicId would come from subdomain or header
    if (!clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    return this.patientAuthService.requestOtp(dto, clinicId);
  }

  /**
   * Verify OTP for patient login
   * POST /api/v1/auth/patients/otp/verify
   */
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: OTPVerifyDto,
    @Headers('x-clinic-id') clinicId?: string,
  ) {
    if (!clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    return this.patientAuthService.verifyOtp(dto, clinicId);
  }

  /**
   * Get current patient profile (protected route)
   * GET /api/v1/auth/patients/me
   */
  @Get('me')
  @UseGuards(JwtPatientGuard)
  getProfile(@Request() req: { user: AuthenticatedPatient }) {
    return {
      patient: req.user,
    };
  }
}
