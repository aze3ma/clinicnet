import { UserRole } from '@prisma/client';

export interface StaffJwtPayload {
  userId: string; // User ID (replaces 'sub')
  email: string;
  role: UserRole; // Type-safe: ADMIN, DOCTOR, RECEPTION
  clinicId: string;
  branchId?: string; // Optional: for doctors assigned to specific branch
  issuer: string; // Issuer: "clinicnet" (replaces 'iss')
  issuedAt?: number; // Issued at timestamp (replaces 'iat')
  expiresAt?: number; // Expiration timestamp (replaces 'exp')
}
