import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { TtsService } from './tts.service';
import { Voiceover } from './voiceover.schema';

@Controller('voiceovers')
export class TtsController {
  constructor(private ttsService: TtsService) {}

  @Post()
  async generateVoiceover(
    @Body('scriptId') scriptId: string,
    @Body('scriptContent') scriptContent: string,
  ): Promise<Voiceover> {
    if (!scriptId || !scriptContent) {
      throw new HttpException(
        'scriptId and scriptContent are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ttsService.generateVoiceover(scriptId, scriptContent);
  }

  @Delete('old')
  async deleteOldVoiceovers(): Promise<{
    message: string;
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const result = await this.ttsService.deleteOldVoiceovers();
    return { message: 'Old voiceovers deleted successfully', ...result };
  }

  @Post('trigger-cleanup')
  async triggerCleanup(): Promise<{ message: string }> {
    await this.ttsService.triggerCleanupJob(); // Use public method
    return { message: 'Cleanup job triggered' };
  }
}
