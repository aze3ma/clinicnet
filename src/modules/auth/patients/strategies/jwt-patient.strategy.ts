import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../common/database/prisma.service';
import { PatientJwtPayload } from '../interfaces/patient-jwt-payload.interface';

@Injectable()
export class JwtPatientStrategy extends PassportStrategy(
  Strategy,
  'jwt-patient',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') || 'CHANGE_ME_IN_PRODUCTION',
    });
  }

  async validate(payload: PatientJwtPayload) {
    // Verify this is a patient token
    if (payload.role !== 'PATIENT') {
      throw new UnauthorizedException('Invalid token for patient access');
    }

    // Verify patient exists
    const patient = await this.prisma.client.patient.findUnique({
      where: { id: payload.userId },
    });

    if (!patient) {
      throw new UnauthorizedException('Patient not found');
    }

    return {
      patientId: patient.id,
      clinicId: patient.clinicId,
      phone: patient.phone,
      role: 'PATIENT',
    };
  }
}
