import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, PrismaService],
  exports: [MessageService, MessageGateway],
})
export class MessageModule {}
