export interface PatientJwtPayload {
  userId: string; // Patient ID
  email: string; // Phone number (used as email)
  role: string; // PATIENT
  clinicId: string;
  issuer: string; // Issuer: "clinicnet"
  issuedAt?: number; // Issued at timestamp
  expiresAt?: number; // Expiration timestamp
}
