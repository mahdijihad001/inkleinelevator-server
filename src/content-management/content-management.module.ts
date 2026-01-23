import { Module } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports : [CloudinaryModule],
  controllers: [ContentManagementController],
  providers: [ContentManagementService],
})
export class ContentManagementModule {}
