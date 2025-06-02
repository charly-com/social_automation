import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptGenerationModule } from '../script-generation/script-generation.module';
import { TtsModule } from '../tts/tts.module';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';
import { VideoModule } from '../video/video.module';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { Schedule, ScheduleSchema } from './schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    ScriptGenerationModule,
    TtsModule,
    ThumbnailModule,
    VideoModule,
  ],
  providers: [SchedulerService],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
