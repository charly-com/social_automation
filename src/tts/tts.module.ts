import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Voiceover, VoiceoverSchema } from './voiceover.schema';
import { TtsService } from './tts.service';
import { TtsController } from './tts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Voiceover.name, schema: VoiceoverSchema },
    ]),
  ],
  providers: [TtsService],
  exports: [TtsService],
  controllers: [TtsController],
})
export class TtsModule {}
