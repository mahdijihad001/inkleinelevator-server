import { Test, TestingModule } from '@nestjs/testing';
import { HowItsForContentManagementService } from './how-its-for-content-management.service';

describe('HowItsForContentManagementService', () => {
  let service: HowItsForContentManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HowItsForContentManagementService],
    }).compile();

    service = module.get<HowItsForContentManagementService>(HowItsForContentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
