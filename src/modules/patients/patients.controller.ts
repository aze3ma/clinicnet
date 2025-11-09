import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { JwtPatientGuard } from '../auth/patients/guards/jwt-patient.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import type { PatientResponseDto } from './dto/patient-response.dto';
import type { AuthenticatedPatient } from '../auth/patients/interfaces/authenticated-patient.interface';

@Controller('patients')
@UseGuards(JwtPatientGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * Get current patient profile
   * GET /api/v1/patients/me
   */
  @Get('me')
  async getProfile(
    @CurrentUser() user: AuthenticatedPatient,
  ): Promise<PatientResponseDto | null> {
    return this.patientsService.findById(user.patientId);
  }

  /**
   * Update patient profile
   * PATCH /api/v1/patients/me
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser('patientId') patientId: string,
    @Body() updateDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(patientId, updateDto);
  }
}
