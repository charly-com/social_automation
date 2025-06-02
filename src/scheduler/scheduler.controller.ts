import { Controller, Post, Get, Query } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { Schedule } from './schedule.schema';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private schedulerService: SchedulerService,
    private configService: ConfigService,
  ) {}

  @Post('trigger-content')
  async triggerDailyContent(): Promise<{ message: string }> {
    await this.schedulerService.triggerDailyContentJob();
    return { message: 'Daily content generation job triggered' };
  }

  @Get('posts')
  async getManualPosts(): Promise<Schedule[]> {
    return this.schedulerService.getManualPosts();
  }

  @Get('auth-url')
  getAuthUrl(): { url: string } {
    const oauth2Client = new OAuth2Client(
      this.configService.get<string>('YOUTUBE_CLIENT_ID'),
      this.configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      this.configService.get<string>('YOUTUBE_REDIRECT_URI'),
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });
    return { url };
  }

  @Get('oauth2callback')
  async oauth2Callback(
    @Query('code') code: string,
  ): Promise<{ message: string }> {
    const oauth2Client = new OAuth2Client(
      this.configService.get<string>('YOUTUBE_CLIENT_ID'),
      this.configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      this.configService.get<string>('YOUTUBE_REDIRECT_URI'),
    );
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Refresh Token:', tokens.refresh_token);
    return { message: 'Add YOUTUBE_REFRESH_TOKEN to .env' };
  }
}
