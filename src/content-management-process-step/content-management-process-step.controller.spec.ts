import { Test, TestingModule } from '@nestjs/testing';
import { ContentManagementProcessStepController } from './content-management-process-step.controller';
import { ContentManagementProcessStepService } from './content-management-process-step.service';

describe('ContentManagementProcessStepController', () => {
  let controller: ContentManagementProcessStepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentManagementProcessStepController],
      providers: [ContentManagementProcessStepService],
    }).compile();

    controller = module.get<ContentManagementProcessStepController>(ContentManagementProcessStepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
