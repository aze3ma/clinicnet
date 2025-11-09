import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import appConfig from './common/config/app.config';
import jwtConfig from './common/config/jwt.config';
import databaseConfig from './common/config/database.config';
import redisConfig from './common/config/redis.config';
import twilioConfig from './common/config/twilio.config';
import { HealthController } from './modules/health/health.controller';
import { DatabaseModule } from './common/database/database.module';
import { StaffAuthModule } from './modules/auth/staff/staff-auth.module';
import { PatientAuthModule } from './modules/auth/patients/patient-auth.module';
import { CacheModule } from './common/cache/cache.module';
import { PatientsModule } from './modules/patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, twilioConfig],
      envFilePath: '.env',
      cache: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    CacheModule,
    StaffAuthModule,
    PatientAuthModule,
    PatientsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
