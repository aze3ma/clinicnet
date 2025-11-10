import { Prisma } from '@prisma/client';

// Use Prisma's utility type for the patient part
type PatientBasic = Prisma.PatientGetPayload<{
  select: {
    id: true;
    phone: true;
    firstName: true;
    lastName: true;
  };
}>;

export interface PatientAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  patient: PatientBasic;
  isNewPatient: boolean;
}
