// message.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(senderId: string, receiverId: string, text: string) {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                text,
            },
            include: {
                sender: { select: { userId: true, name: true } },
                receiver: { select: { userId: true, name: true } },
            },
        });
    }

    async getMessagesBetweenUsers(userA: string, userB: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userA, receiverId: userB },
                    { senderId: userB, receiverId: userA },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}
