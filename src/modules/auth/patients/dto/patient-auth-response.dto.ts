export class PatientAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  patient: {
    id: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
  };
  isNewPatient: boolean;
}
