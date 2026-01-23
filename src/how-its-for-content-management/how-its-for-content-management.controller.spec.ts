import { Test, TestingModule } from '@nestjs/testing';
import { HowItsForContentManagementController } from './how-its-for-content-management.controller';
import { HowItsForContentManagementService } from './how-its-for-content-management.service';

describe('HowItsForContentManagementController', () => {
  let controller: HowItsForContentManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HowItsForContentManagementController],
      providers: [HowItsForContentManagementService],
    }).compile();

    controller = module.get<HowItsForContentManagementController>(HowItsForContentManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
