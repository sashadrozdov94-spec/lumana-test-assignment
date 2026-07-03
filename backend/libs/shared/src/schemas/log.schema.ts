import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SystemLog extends Document {
  @Prop({ required: true })
  type: string; // 'IMPORT' | 'API_READ'

  @Prop({ required: true })
  count: number;

  @Prop({ default: null })
  searchQuery: string;

  @Prop({ required: true })
  timestamp: string;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
// Indexing for efficient filtering by type and date
SystemLogSchema.index({ type: 1, createdAt: -1 });