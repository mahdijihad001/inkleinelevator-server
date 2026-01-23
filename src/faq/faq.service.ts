import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FaqService {

    constructor(private prisma: PrismaService) { }

    async createFaq(data: { question: string, ans: string }) {

        const result = await this.prisma.faq.create({
            data: {
                question: data.question,
                ans: data.ans
            }
        });
        return result
    };

    async deleteFaq(faqId: string) {
        await this.prisma.faq.delete({
            where: {
                qaCardId: faqId
            }
        })
    };

    async updateFaq(faqId: string, data: { question: string, ans: string }) {
        const result = await this.prisma.faq.update({
            where: {
                qaCardId: faqId
            },
            data: {
                question: data.question,
                ans: data.ans
            }
        });
        return result
    }

    async getAllFaqs() {
        return this.prisma.faq.findMany({});
    }
}
