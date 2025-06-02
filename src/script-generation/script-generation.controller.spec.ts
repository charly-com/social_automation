import { Test, TestingModule } from '@nestjs/testing';
import { ScriptGenerationController } from './script-generation.controller';

describe('ScriptGenerationController', () => {
  let controller: ScriptGenerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScriptGenerationController],
    }).compile();

    controller = module.get<ScriptGenerationController>(
      ScriptGenerationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
