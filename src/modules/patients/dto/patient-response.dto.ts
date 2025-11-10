import { Prisma } from '@prisma/client';

// Use Prisma's utility type to auto-generate from select
export type PatientResponseDto = Prisma.PatientGetPayload<{
  select: {
    id: true;
    phone: true;
    email: true;
    firstName: true;
    lastName: true;
    dateOfBirth: true;
    gender: true;
    createdAt: true;
  };
}>;
