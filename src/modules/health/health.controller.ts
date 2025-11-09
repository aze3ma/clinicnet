import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const clinicCount = await this.prisma.client.clinic.count();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        clinics: clinicCount,
      },
    };
  }
}
