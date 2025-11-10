import { UserRole } from '@prisma/client';

/**
 * Represents the authenticated staff user object attached to request.user
 * This is the return value from JwtStaffStrategy.validate()
 */
export interface AuthenticatedStaff {
  userId: string;
  email: string;
  role: UserRole; // Now type-safe with Prisma enum
  clinicId: string;
}
