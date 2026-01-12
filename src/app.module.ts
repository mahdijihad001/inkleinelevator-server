import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }), AuthModule, JobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
