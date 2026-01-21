import { Test, TestingModule } from '@nestjs/testing';
import { ContentManagementProcessStepService } from './content-management-process-step.service';

describe('ContentManagementProcessStepService', () => {
  let service: ContentManagementProcessStepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentManagementProcessStepService],
    }).compile();

    service = module.get<ContentManagementProcessStepService>(ContentManagementProcessStepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
