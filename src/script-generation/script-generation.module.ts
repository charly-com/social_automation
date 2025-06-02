import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Script, ScriptSchema } from './script.schema';
import { ScriptGenerationService } from './script-generation.service';
import { ScriptGenerationController } from './script-generation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Script.name, schema: ScriptSchema }]),
  ],
  providers: [ScriptGenerationService],
  exports: [ScriptGenerationService],
  controllers: [ScriptGenerationController],
})
export class ScriptGenerationModule {}
