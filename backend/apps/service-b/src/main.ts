import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ServiceBModule } from './service-b.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ServiceBModule);
  
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: configService.get<string>('REDIS_HOST') || 'localhost', 
      port: configService.get<number>('REDIS_PORT') || 6379,
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'report',
      protoPath: join(process.cwd(), 'report.proto'), 
      url: configService.get<string>('GRPC_URL') || '0.0.0.0:50051', 
    },
  });

  app.enableCors();

  await app.startAllMicroservices();
  
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
}

bootstrap();