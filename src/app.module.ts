import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TtsModule } from './tts/tts.module';
import { AgendaModule } from './agenda/agenda.module'; // Import custom module
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { VideoModule } from './video/video.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    TtsModule,
    AgendaModule,
    ThumbnailModule,
    VideoModule,
    SchedulerModule,
  ],
})
export class AppModule {}
