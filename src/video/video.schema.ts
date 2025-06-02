import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Video extends Document {
  @Prop({ required: true })
  videoId: string;

  @Prop({ required: true })
  scriptId: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
