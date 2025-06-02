import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Thumbnail } from './thumbnail.schema';
import { Agenda } from 'agenda';

@Injectable()
export class ThumbnailService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Thumbnail.name) private thumbnailModel: Model<Thumbnail>,
    @Inject('AGENDA') private agenda: Agenda,
  ) {
    this.agenda.define('delete-old-thumbnails', async () => {
      await this.deleteOldThumbnails();
    });

    this.agenda.on('ready', () => {
      this.agenda.every('1 day', 'delete-old-thumbnails');
      console.log('Agenda job scheduled for daily thumbnail cleanup');
    });
  }

  async generateThumbnail(
    scriptId: string,
    prompt: string,
  ): Promise<Thumbnail> {
    try {
      // Call Craiyon API (using unofficial endpoint, replace with official if available)
      const response = await axios.post(
        'https://api.craiyon.com/v3', // Note: Unofficial, verify endpoint
        { prompt },
        { responseType: 'arraybuffer' },
      );

      // Save image locally
      const thumbnailPath = join(
        __dirname,
        `../../Uploads/thumbnails/${scriptId}.png`,
      );
      await fs.mkdir(join(__dirname, '../../Uploads/thumbnails'), {
        recursive: true,
      });
      await fs.writeFile(thumbnailPath, response.data);

      // Store URL
      const thumbnailUrl = `/Uploads/thumbnails/${scriptId}.png`;
      const newThumbnail = new this.thumbnailModel({ scriptId, thumbnailUrl });
      return newThumbnail.save();
    } catch (error) {
      console.error(
        'Craiyon API Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate thumbnail');
    }
  }

  async deleteOldThumbnails(): Promise<{
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldThumbnails = await this.thumbnailModel
      .find({ createdAt: { $lt: thirtyDaysAgo } })
      .exec();
    let deletedFiles = 0;
    let deletedRecords = 0;

    for (const thumbnail of oldThumbnails) {
      const filePath = join(__dirname, `../../${thumbnail.thumbnailUrl}`);
      try {
        await fs.unlink(filePath);
        deletedFiles++;
      } catch (error) {
        console.warn(`File not found: ${filePath}`);
      }
      await this.thumbnailModel.deleteOne({ _id: thumbnail._id });
      deletedRecords++;
    }

    console.log(
      `Deleted ${deletedFiles} thumbnails and ${deletedRecords} records`,
    );
    return { deletedFiles, deletedRecords };
  }

  async triggerThumbnailCleanupJob(): Promise<void> {
    await this.agenda.now('delete-old-thumbnails', {});
  }
}
