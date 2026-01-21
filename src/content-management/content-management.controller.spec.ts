import { Test, TestingModule } from '@nestjs/testing';
import { ContentManagementController } from './content-management.controller';
import { ContentManagementService } from './content-management.service';

describe('ContentManagementController', () => {
  let controller: ContentManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentManagementController],
      providers: [ContentManagementService],
    }).compile();

    controller = module.get<ContentManagementController>(ContentManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
