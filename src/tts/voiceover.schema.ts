import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Voiceover extends Document {
  @Prop({ required: true })
  scriptId: string;

  @Prop({ required: true })
  audioUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const VoiceoverSchema = SchemaFactory.createForClass(Voiceover);
