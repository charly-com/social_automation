import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Voiceover } from './voiceover.schema';
import { Agenda } from 'agenda';

@Injectable()
export class TtsService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Voiceover.name) private voiceoverModel: Model<Voiceover>,
    @Inject('AGENDA') private agenda: Agenda,
  ) {
    this.agenda.define('delete-old-voiceovers', async () => {
      await this.deleteOldVoiceovers();
    });

    this.agenda.on('ready', () => {
      this.agenda.every('1 day', 'delete-old-voiceovers');
      console.log('Agenda job scheduled for daily cleanup');
    });
  }

  async generateVoiceover(
    scriptId: string,
    scriptContent: string,
  ): Promise<Voiceover> {
    const apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice (e.g., Rachel)

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: scriptContent,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        },
      );

      const audioPath = join(
        __dirname,
        `../../Uploads/voiceovers/${scriptId}.mp3`,
      );
      await fs.writeFile(audioPath, response.data);

      const audioUrl = `/Uploads/voiceovers/${scriptId}.mp3`;
      const newVoiceover = new this.voiceoverModel({ scriptId, audioUrl });
      return newVoiceover.save();
    } catch (error) {
      console.error(
        'ElevenLabs API Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate voiceover');
    }
  }

  async deleteOldVoiceovers(): Promise<{
    deletedFiles: number;
    deletedRecords: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldVoiceovers = await this.voiceoverModel
      .find({ createdAt: { $lt: thirtyDaysAgo } })
      .exec();
    let deletedFiles = 0;
    let deletedRecords = 0;

    for (const voiceover of oldVoiceovers) {
      const filePath = join(__dirname, `../../${voiceover.audioUrl}`);
      try {
        await fs.unlink(filePath);
        deletedFiles++;
      } catch (error) {
        console.warn(`File not found: ${filePath}`);
      }
      await this.voiceoverModel.deleteOne({ _id: voiceover._id });
      deletedRecords++;
    }

    console.log(`Deleted ${deletedFiles} files and ${deletedRecords} records`);
    return { deletedFiles, deletedRecords };
  }

  async triggerCleanupJob(): Promise<void> {
    await this.agenda.now('delete-old-voiceovers', {});
  }
}
