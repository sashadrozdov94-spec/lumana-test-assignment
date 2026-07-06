import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Character, CharacterSchema, SharedModule } from '@app/shared';
import { ConfigModule } from '@nestjs/config';
import { CharacterRepository } from './character.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/lumana'
      })
    }),
    MongooseModule.forFeature([{ name: Character.name, schema: CharacterSchema }]),
    SharedModule,
    ClientsModule.register([
      {
        name: 'SERVICE_B_CLIENT',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService,CharacterRepository],
})
export class AppModule {}