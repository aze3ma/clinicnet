import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StaffAuthService } from './services/staff-auth.service';
import { StaffAuthController } from './staff-auth.controller';
import { JwtStaffStrategy } from './strategies/jwt-staff.strategy';
import { JwtConfigFactory } from '../shared/config/jwt-config.factory';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-staff' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        JwtConfigFactory.createJwtOptions(configService),
    }),
  ],
  controllers: [StaffAuthController],
  providers: [StaffAuthService, JwtStaffStrategy],
  exports: [StaffAuthService, JwtStaffStrategy, PassportModule, JwtModule],
})
export class StaffAuthModule {}
