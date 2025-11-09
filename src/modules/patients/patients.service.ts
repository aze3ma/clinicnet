import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import type { PatientResponseDto } from './dto/patient-response.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PatientResponseDto | null> {
    return this.prisma.client.patient.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.prisma.client.patient.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
      },
    });
  }
}
