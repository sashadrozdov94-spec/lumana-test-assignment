import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ServiceBModule } from './service-b.module';
import { join } from 'path';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ServiceBModule);

  // 1. Redis Pub/Sub Transporter
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost', 
      port: 6379,
    },
  });

  // 2. gRPC Transporter (BONUS)
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'report',
      protoPath: join(process.cwd(), 'report.proto'), 
      url: process.env.GRPC_URL || '0.0.0.0:50051', 
    },
  });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(3001);
}

bootstrap();