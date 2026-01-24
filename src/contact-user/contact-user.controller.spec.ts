import { Test, TestingModule } from '@nestjs/testing';
import { ContactUserController } from './contact-user.controller';
import { ContactUserService } from './contact-user.service';

describe('ContactUserController', () => {
  let controller: ContactUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactUserController],
      providers: [ContactUserService],
    }).compile();

    controller = module.get<ContactUserController>(ContactUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
