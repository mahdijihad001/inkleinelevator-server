import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/socket/message',
})
@Injectable()
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Map<string, string> = new Map(); 

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
      console.log(`User connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const disconnectedUser = Array.from(this.onlineUsers.entries()).find(
      ([_, socketId]) => socketId === client.id,
    );
    if (disconnectedUser) {
      this.onlineUsers.delete(disconnectedUser[0]);
      console.log(`User disconnected: ${disconnectedUser[0]}`);
    }
  }

  async sendMessageToUser(senderId: string, receiverId: string, text: string) {

    const message = await this.messageService.sendMessage(senderId, receiverId, text);

    const receiverSocketId = this.onlineUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive-message', message);
    }

    return message;
  }
}
