import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT as string, 10) || 4000,
  environment: process.env.NODE_ENV || 'development',
  apiVersion: 'v1',
}));
