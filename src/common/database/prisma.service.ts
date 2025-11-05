import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  type INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('❌ Database disconnected');
  }

  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}
