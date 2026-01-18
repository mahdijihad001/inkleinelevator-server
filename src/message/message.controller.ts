// message.controller.ts
import { Controller, Post, Body, Req, Get, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SendMessageDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageGateway: MessageGateway,
  ) { }

  
  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send Message' })
  async sendMessage(@Req() req: any, @Body() body: SendMessageDto) {
    const senderId = req.user.userId;
    const { receiverId, text } = body;

    const message = await this.messageGateway.sendMessageToUser(senderId, receiverId, text);

    return {
      success: true,
      message: 'Message sent successfully',
      data: message,
    };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Message History"
  })
  async getMessages(
    @Req() req: any,
    @Query('withUserId') withUserId: string,
  ) {
    const userId = req.user.userId;
    const messages = await this.messageService.getMessagesBetweenUsers(userId, withUserId);
    return messages;
  }
}
