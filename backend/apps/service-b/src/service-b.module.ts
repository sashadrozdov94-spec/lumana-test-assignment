import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceBController } from './service-b.controller';
import { ServiceBService } from './service-b.service';
import { SystemLog, SystemLogSchema, SharedModule } from '@app/shared';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/lumana'),
    MongooseModule.forFeature([{ name: SystemLog.name, schema: SystemLogSchema }]),
    SharedModule,
  ],
  controllers: [ServiceBController],
  providers: [ServiceBService],
})
export class ServiceBModule {}