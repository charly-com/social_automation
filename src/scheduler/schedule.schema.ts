import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Schedule extends Document {
  @Prop({ required: true })
  videoId: string;

  @Prop({
    required: true,
    enum: ['youtube', 'facebook', 'instagram', 'tiktok'],
  })
  platform: string;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ default: 'pending', enum: ['pending', 'posted', 'manual', 'failed'] })
  status: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  caption?: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
