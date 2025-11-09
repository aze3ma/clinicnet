import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export class JwtConfigFactory {
  static createJwtOptions(configService: ConfigService): JwtModuleOptions {
    const expiresIn = (configService.get<string>('jwt.expiresIn') ||
      '1h') as JwtSignOptions['expiresIn'];
    return {
      secret:
        configService.get<string>('jwt.secret') || 'CHANGE_ME_IN_PRODUCTION',
      signOptions: {
        expiresIn,
      },
    };
  }
}
