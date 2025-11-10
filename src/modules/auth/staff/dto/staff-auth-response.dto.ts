import { Prisma } from '@prisma/client';

// Use Prisma's utility type for the user part
type StaffUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    firstName: true;
    lastName: true;
    role: true;
    clinicId: true;
  };
}>;

export interface StaffAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: StaffUser;
}
