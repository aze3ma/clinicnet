import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  // Security
  app.use(helmet()); // Security headers

  // CORS - handle comma-separated origins from environment
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : corsOrigin;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, // /api/v1/...
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error on extra properties
      transform: true, // Auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true, // Convert primitive types
      },
    }),
  );

  // Logging (we'll add Pino later)
  // app.useLogger(app.get(Logger));

  await app.listen(port as number);
  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
}

void bootstrap();
