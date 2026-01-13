import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategie } from './strategies/at.strategies';
import { RtStrategies } from './strategies/rt.strategies';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [JwtModule.register({}) , CloudinaryModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategie, RtStrategies],
})
export class AuthModule { }
