import { Controller, Post, Body } from '@nestjs/common';
import { ScriptGenerationService } from './script-generation.service';
import { Script } from './script.schema';

@Controller('scripts')
export class ScriptGenerationController {
  constructor(private scriptGenerationService: ScriptGenerationService) {}

  @Post()
  async generateScript(@Body('topic') topic: string): Promise<Script> {
    return this.scriptGenerationService.generateScript(topic);
  }
}
