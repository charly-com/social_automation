import { Test, TestingModule } from '@nestjs/testing';
import { ScriptGenerationService } from './script-generation.service';

describe('ScriptGenerationService', () => {
  let service: ScriptGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScriptGenerationService],
    }).compile();

    service = module.get<ScriptGenerationService>(ScriptGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
