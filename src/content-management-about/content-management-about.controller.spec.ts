import { Test, TestingModule } from '@nestjs/testing';
import { ContentManagementAboutController } from './content-management-about.controller';
import { ContentManagementAboutService } from './content-management-about.service';

describe('ContentManagementAboutController', () => {
  let controller: ContentManagementAboutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentManagementAboutController],
      providers: [ContentManagementAboutService],
    }).compile();

    controller = module.get<ContentManagementAboutController>(ContentManagementAboutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
