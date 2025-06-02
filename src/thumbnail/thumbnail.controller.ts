import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ThumbnailService } from './thumbnail.service';
import { Thumbnail } from './thumbnail.schema';

@Controller('thumbnails')
export class ThumbnailController {
  constructor(private thumbnailService: ThumbnailService) {}

  @Post()
  async generateThumbnail(
    @Body('scriptId') scriptId: string,
    @Body('prompt') prompt: string,
  ): Promise<Thumbnail> {
    if (!scriptId || !prompt) {
      throw new HttpException(
        'scriptId and prompt are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.thumbnailService.generateThumbnail(scriptId, prompt);
  }

  @Delete('old')
  async deleteOldThumbnails(): Promise<{
    message: string;
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const result = await this.thumbnailService.deleteOldThumbnails();
    return { message: 'Old thumbnails deleted successfully', ...result };
  }

  @Post('trigger-cleanup')
  async triggerCleanup(): Promise<{ message: string }> {
    await this.thumbnailService.triggerThumbnailCleanupJob();
    return { message: 'Thumbnail cleanup job triggered' };
  }
}
