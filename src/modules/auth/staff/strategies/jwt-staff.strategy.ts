import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { StaffAuthService } from '../services/staff-auth.service';
import { StaffJwtPayload } from '../interfaces/staff-jwt-payload.interface';

@Injectable()
export class JwtStaffStrategy extends PassportStrategy(Strategy, 'jwt-staff') {
  constructor(
    private readonly configService: ConfigService,
    private readonly staffAuthService: StaffAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') || 'CHANGE_ME_IN_PRODUCTION',
    });
  }

  async validate(payload: StaffJwtPayload) {
    // This method is called after JWT is verified
    // Payload is already decoded and signature verified

    // Additional validation (check if user still exists and is active)
    const user = await this.staffAuthService.validateUser(payload);

    // This will be attached to request.user
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    };
  }
}
