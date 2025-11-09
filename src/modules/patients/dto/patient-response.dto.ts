import { Gender } from '@prisma/client';

export class PatientResponseDto {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: Gender | null;
  createdAt: Date;
}
