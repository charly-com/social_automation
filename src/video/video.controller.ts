import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './video.schema';

@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post()
  async generateVideo(@Body('scriptId') scriptId: string): Promise<Video> {
    if (!scriptId) {
      throw new HttpException('scriptId is required', HttpStatus.BAD_REQUEST);
    }
    return this.videoService.generateVideo(scriptId);
  }

  @Delete('old')
  async deleteOldVideos(): Promise<{
    message: string;
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const result = await this.videoService.deleteOldVideos();
    return { message: 'Old videos deleted successfully', ...result };
  }

  @Post('trigger-cleanup')
  async triggerCleanup(): Promise<{ message: string }> {
    await this.videoService.triggerVideoCleanupJob();
    return { message: 'Video cleanup job triggered' };
  }
}
