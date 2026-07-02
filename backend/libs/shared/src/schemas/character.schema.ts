import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Character extends Document {
  @Prop({ required: true, unique: true })
  id!: number;

  @Prop({ required: true })
  name!: string;

  @Prop()
  status!: string;

  @Prop()
  species!: string;

  @Prop()
  type!: string;

  @Prop()
  gender!: string;

  @Prop({ type: Object })
  origin!: { name: string; url: string };

  @Prop({ type: Object })
  location!: { name: string; url: string };

  @Prop()
  image!: string;

  @Prop({ type: [String] })
  episode!: string[];

  @Prop()
  url!: string;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
CharacterSchema.index({ name: 'text' });