import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientAuthModule } from '../auth/patients/patient-auth.module';

@Module({
  imports: [PatientAuthModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
