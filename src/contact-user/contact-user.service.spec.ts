import { Test, TestingModule } from '@nestjs/testing';
import { ContactUserService } from './contact-user.service';

describe('ContactUserService', () => {
  let service: ContactUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactUserService],
    }).compile();

    service = module.get<ContactUserService>(ContactUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
