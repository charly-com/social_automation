import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Agenda } from 'agenda';
import { TtsModule } from '../tts/tts.module';

@Global()
@Module({
  imports: [ConfigModule, TtsModule],
  providers: [
    {
      provide: 'AGENDA',
      useFactory: async (configService: ConfigService) => {
        const agenda = new Agenda({
          db: {
            address: configService.get<string>('MONGODB_URI'),
            collection: 'jobs',
          },
        });
        await agenda.start();
        return agenda;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['AGENDA'],
})
export class AgendaModule {}
