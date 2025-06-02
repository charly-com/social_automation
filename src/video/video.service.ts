import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { Video } from './video.schema';
import { Agenda } from 'agenda';

@Injectable()
export class VideoService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @Inject('AGENDA') private agenda: Agenda,
  ) {
    this.agenda.define('delete-old-videos', async () => {
      await this.deleteOldVideos();
    });

    this.agenda.on('ready', () => {
      this.agenda.every('1 day', 'delete-old-videos');
      console.log('Agenda job scheduled for daily video cleanup');
    });
  }

  async generateVideo(scriptId: string): Promise<Video> {
    const videoId = uuidv4();
    const voiceoverPath = join(
      __dirname,
      `../../Uploads/voiceovers/${scriptId}.mp3`,
    );
    const thumbnailPath = join(
      __dirname,
      `../../Uploads/thumbnails/${scriptId}.png`,
    );
    const outputPath = join(__dirname, `../../Uploads/videos/${videoId}.mp4`);

    try {
      // Verify input files exist
      await fs.access(voiceoverPath);
      await fs.access(thumbnailPath);

      // Create output directory
      await fs.mkdir(join(__dirname, '../../Uploads/videos'), {
        recursive: true,
      });

      // Compile video using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(thumbnailPath)
          .loop() // Loop thumbnail for video duration
          .input(voiceoverPath)
          .audioCodec('aac')
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt yuv420p', // Ensure compatibility
            '-tune stillimage', // Optimize for static image
            '-shortest', // Match voiceover duration
            '-vf scale=1280:720', // 720p resolution
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Store video metadata
      const videoUrl = `/Uploads/videos/${videoId}.mp4`;
      const newVideo = new this.videoModel({ videoId, scriptId, videoUrl });
      return newVideo.save();
    } catch (error) {
      console.error('Video Compilation Error:', error.message);
      throw new Error('Failed to generate video');
    }
  }

  async deleteOldVideos(): Promise<{
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldVideos = await this.videoModel
      .find({ createdAt: { $lt: thirtyDaysAgo } })
      .exec();
    let deletedFiles = 0;
    let deletedRecords = 0;

    for (const video of oldVideos) {
      const filePath = join(__dirname, `../../${video.videoUrl}`);
      try {
        await fs.unlink(filePath);
        deletedFiles++;
      } catch (error) {
        console.warn(`File not found: ${filePath}`);
      }
      await this.videoModel.deleteOne({ _id: video._id });
      deletedRecords++;
    }

    console.log(`Deleted ${deletedFiles} videos and ${deletedRecords} records`);
    return { deletedFiles, deletedRecords };
  }

  async triggerVideoCleanupJob(): Promise<void> {
    await this.agenda.now('delete-old-videos', {});
  }
}
