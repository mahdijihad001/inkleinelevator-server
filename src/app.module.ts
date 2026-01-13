import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { CloudinaryProvider } from './config/CloudinaryProvider';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }), AuthModule, JobModule, CloudinaryModule, StripeModule],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider],
  exports: ["CLOUDINARY"]
})
export class AppModule { }
