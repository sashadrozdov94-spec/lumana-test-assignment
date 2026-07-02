import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Character, CharacterSchema } from '@app/shared';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/lumana'),
    MongooseModule.forFeature([{ name: Character.name, schema: CharacterSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}