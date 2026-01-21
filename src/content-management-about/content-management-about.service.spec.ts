import { Test, TestingModule } from '@nestjs/testing';
import { ContentManagementAboutService } from './content-management-about.service';

describe('ContentManagementAboutService', () => {
  let service: ContentManagementAboutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentManagementAboutService],
    }).compile();

    service = module.get<ContentManagementAboutService>(ContentManagementAboutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
