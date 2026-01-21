import { Module } from '@nestjs/common';
import { ContentManagementProcessStepService } from './content-management-process-step.service';
import { ContentManagementProcessStepController } from './content-management-process-step.controller';

@Module({
  controllers: [ContentManagementProcessStepController],
  providers: [ContentManagementProcessStepService],
})
export class ContentManagementProcessStepModule {}
