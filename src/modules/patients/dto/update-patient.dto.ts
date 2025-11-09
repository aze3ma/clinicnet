import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
