/**
 * Represents the authenticated patient object attached to request.user
 * This is the return value from JwtPatientStrategy.validate()
 */
export interface AuthenticatedPatient {
  patientId: string;
  clinicId: string;
  phone: string;
  role: string; // 'PATIENT'
}
