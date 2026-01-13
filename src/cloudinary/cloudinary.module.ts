import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from 'src/config/CloudinaryProvider';

@Module({
  controllers: [],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService]
})
export class CloudinaryModule { }
