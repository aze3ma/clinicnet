import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class OTPRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in international format (e.g., +201234567890)',
  })
  phone: string;
}
