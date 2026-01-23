import { Module } from '@nestjs/common';
import { HowItsForContentManagementService } from './how-its-for-content-management.service';
import { HowItsForContentManagementController } from './how-its-for-content-management.controller';

@Module({
  controllers: [HowItsForContentManagementController],
  providers: [HowItsForContentManagementService],
})
export class HowItsForContentManagementModule {}
