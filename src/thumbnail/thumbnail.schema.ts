import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Thumbnail extends Document {
  @Prop({ required: true })
  scriptId: string;

  @Prop({ required: true })
  thumbnailUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ThumbnailSchema = SchemaFactory.createForClass(Thumbnail);
