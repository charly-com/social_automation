import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Script } from './script.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScriptGenerationService {
  constructor(
    private configService: ConfigService,
    @InjectModel(Script.name) private scriptModel: Model<Script>,
  ) {}

  async generateScript(topic: string): Promise<Script> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Write a 30-60 second script for a social media video about ${topic} for Nigerian youth interested in personal finance.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const scriptContent = response.data.choices[0].message.content;
      const newScript = new this.scriptModel({
        scriptId: uuidv4(), // Generate scriptId
        topic,
        content: scriptContent,
      });
      return newScript.save();
    } catch (error) {
      console.error(
        'OpenRouter API Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate script');
    }
  }
  //   async generateScript(topic: string): Promise<Script> {
  //     const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
  //     const response = await axios.post(
  //       'https://openrouter.ai/api/v1/chat/completions',
  //       {
  //         model: 'gpt-3.5-turbo',
  //         messages: [
  //           {
  //             role: 'user',
  //             content: `Write a 30-60 second script for a social media video about ${topic} for Nigerian youth interested in personal finance.`,
  //           },
  //         ],
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${apiKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     const scriptContent = response.data.choices[0].message.content;
  //     const newScript = new this.scriptModel({ topic, content: scriptContent });
  //     return newScript.save();
  //   }
}
