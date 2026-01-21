import { Module } from '@nestjs/common';
import { ContentManagementAboutService } from './content-management-about.service';
import { ContentManagementAboutController } from './content-management-about.controller';

@Module({
  controllers: [ContentManagementAboutController],
  providers: [ContentManagementAboutService],
})
export class ContentManagementAboutModule {}
