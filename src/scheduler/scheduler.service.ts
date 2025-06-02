/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agenda } from 'agenda';
import { ScriptGenerationService } from '../script-generation/script-generation.service'; // Fixed import
import { TtsService } from '../tts/tts.service';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { VideoService } from '../video/video.service';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { join } from 'path';
import { Schedule } from './schedule.schema';
import axios from 'axios';

@Injectable()
export class SchedulerService {
  private youtube;

  constructor(
    private configService: ConfigService,
    private scriptService: ScriptGenerationService, // Fixed type
    private ttsService: TtsService,
    private thumbnailService: ThumbnailService,
    private videoService: VideoService,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @Inject('AGENDA') private agenda: Agenda,
  ) {
    // Initialize YouTube API client
    const oauth2Client = new OAuth2Client(
      this.configService.get<string>('YOUTUBE_CLIENT_ID'),
      this.configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      this.configService.get<string>('YOUTUBE_REDIRECT_URI'),
    );
    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('YOUTUBE_REFRESH_TOKEN'),
    });
    this.youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Define jobs
    this.agenda.define('generate-daily-content', async () => {
      await this.generateDailyContent();
    });
    this.agenda.define('post-video', async (job) => {
      const { videoId, platform } = job.attrs.data;
      await this.postVideo(videoId, platform);
    });

    this.agenda.on('ready', () => {
      this.agenda.every('1 day', 'generate-daily-content');
      console.log('Agenda job scheduled for daily content generation');
    });
  }

  async generateDailyContent(): Promise<void> {
    try {
      // Step 1: Generate Script
      const script = await this.scriptService.generateScript('budgeting tips'); // Added topic
      const scriptId = script.scriptId || script._id.toString(); // Ensure scriptId exists

      // Step 2: Generate Voiceover
      const voiceover = await this.ttsService.generateVoiceover(
        scriptId,
        script.content,
      );

      // Step 3: Generate Thumbnail (mock)
      const thumbnail = await this.thumbnailService.generateThumbnail(
        scriptId,
        'Budgeting tips for Nigerian youth',
      );

      // Step 4: Generate Video
      const video = await this.videoService.generateVideo(scriptId);

      // Step 5: Schedule Posts
      const scheduledAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
      const caption = 'Budgeting Tips for Nigerian Youth';
      await this.scheduleVideo(video.videoId, 'youtube', scheduledAt, caption);
      await this.scheduleVideo(video.videoId, 'facebook', scheduledAt, caption);
      await this.scheduleVideo(
        video.videoId,
        'instagram',
        scheduledAt,
        caption,
        true,
      );
      await this.scheduleVideo(
        video.videoId,
        'tiktok',
        scheduledAt,
        caption,
        true,
      );
    } catch (error) {
      console.error('Daily Content Generation Error:', error.message);
      throw error;
    }
  }

  async scheduleVideo(
    videoId: string,
    platform: string,
    scheduledAt: Date,
    caption: string,
    isManual = false,
  ): Promise<Schedule> {
    const videoUrl = `/Uploads/videos/${videoId}.mp4`;
    const schedule = new this.scheduleModel({
      videoId,
      platform,
      scheduledAt,
      status: isManual ? 'manual' : 'pending',
      videoUrl,
      caption,
    });
    await schedule.save();

    if (!isManual) {
      await this.agenda.schedule(scheduledAt, 'post-video', {
        videoId,
        platform,
      });
    }
    return schedule;
  }

  async postVideo(videoId: string, platform: string): Promise<void> {
    const videoPath = join(__dirname, `../../Uploads/videos/${videoId}.mp4`);
    const schedule = await this.scheduleModel
      .findOne({ videoId, platform })
      .exec();
    if (!schedule) throw new Error('Schedule not found');

    try {
      if (platform === 'youtube') {
        await this.youtube.videos.insert({
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: 'Budgeting Tips for Nigerian Youth',
              description: schedule.caption,
              tags: ['budgeting', 'finance', 'Nigerian youth'],
              categoryId: '27', // Education
            },
            status: { privacyStatus: 'public' },
          },
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          media: { body: require('fs').createReadStream(videoPath) },
        });
      } else if (platform === 'facebook') {
        await axios.post(
          `https://graph-video.facebook.com/v20.0/me/videos`,
          {
            file_url: `${this.configService.get<string>('BASE_URL')}/Uploads/videos/${videoId}.mp4`,
            description: schedule.caption,
          },
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>('FACEBOOK_ACCESS_TOKEN')}`,
            },
          },
        );
      }
      await this.scheduleModel.updateOne(
        { videoId, platform },
        { status: 'posted' },
      );
      console.log(`Video ${videoId} posted to ${platform}`);
    } catch (error) {
      await this.scheduleModel.updateOne(
        { videoId, platform },
        { status: 'failed' },
      );
      console.error(`Post to ${platform} Error:`, error.message);
      throw new Error(`Failed to post video to ${platform}`);
    }
  }

  async getManualPosts(): Promise<Schedule[]> {
    return this.scheduleModel
      .find({ status: 'manual', platform: { $in: ['instagram', 'tiktok'] } })
      .exec();
  }

  async triggerDailyContentJob(): Promise<void> {
    await this.agenda.now('generate-daily-content', {});
  }
}
