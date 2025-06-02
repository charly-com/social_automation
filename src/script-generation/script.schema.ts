import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Script extends Document {
  @Prop({ required: true })
  scriptId: string; // Added for SchedulerService

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ScriptSchema = SchemaFactory.createForClass(Script);
