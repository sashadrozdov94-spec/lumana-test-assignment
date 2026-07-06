import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Lumana API - Service A')
    .setDescription('The character API description')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}

bootstrap();