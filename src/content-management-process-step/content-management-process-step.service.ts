import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHowItWorksDto, CreateHowItWorksStepDto } from './dto/content-management-process-step.dto';

@Injectable()
export class ContentManagementProcessStepService {
    constructor(private prisma: PrismaService) { }

    async createSection(dto: CreateHowItWorksDto) {
        const exists = await this.prisma.howItWorksSection.findUnique({
            where: { howToWorksKey: "HOW_IT_WORKS_KEY" },
        });
        if (exists) {
            throw new BadRequestException('How It Works section already exists');
        }
        return await this.prisma.howItWorksSection.create({
            data: {
                howToWorksKey: "HOW_IT_WORKS_KEY",
                ...dto,
            },
        });
    }

    async getSection() {
        const section = await this.prisma.howItWorksSection.findUnique({
            where: { howToWorksKey: "HOW_IT_WORKS_KEY" },
            include: { steps: true },
        });

        if (!section) {
            throw new NotFoundException('How It Works section not found');
        }

        return section;
    }

    async updateSection(dto: CreateHowItWorksDto) {
        const section = await this.prisma.howItWorksSection.findUnique({
            where: { howToWorksKey: "HOW_IT_WORKS_KEY" },
        });

        if (!section) {
            throw new NotFoundException('How It Works section not found');
        }

        return await this.prisma.howItWorksSection.update({
            where: { howToWorksKey: "HOW_IT_WORKS_KEY" },
            data: dto,
        });
    }

    // ---------- STEPS ----------

    async addStep(dto: CreateHowItWorksStepDto) {
        const section = await this.prisma.howItWorksSection.findUnique({
            where: { howToWorksKey: "HOW_IT_WORKS_KEY" },
        });

        if (!section) {
            throw new NotFoundException('How It Works section not found');
        }

        const existingStep = await this.prisma.howItWorksStep.findFirst({
            where: { sectionId: section.id, title: dto.title },
        });

        if (existingStep) {
            throw new BadRequestException(
                `Step with title "${dto.title}" already exists`,
            );
        }

        return await this.prisma.howItWorksStep.create({
            data: {
                ...dto,
                sectionId: section.id,
            },
        });
    }

    async updateStep(id: string, dto: CreateHowItWorksStepDto) {
        const step = await this.prisma.howItWorksStep.findUnique({ where: { id } });
        if (!step) {
            throw new NotFoundException('Step not found');
        }

        if (dto.title) {
            const duplicate = await this.prisma.howItWorksStep.findFirst({
                where: { sectionId: step.sectionId, title: dto.title, NOT: { id } },
            });
            if (duplicate) {
                throw new BadRequestException(
                    `Step with title "${dto.title}" already exists`,
                );
            }
        }

        return await this.prisma.howItWorksStep.update({
            where: { id },
            data: dto,
        });
    }

    async deleteStep(id: string) {
        const step = await this.prisma.howItWorksStep.findUnique({ where: { id } });
        if (!step) {
            throw new NotFoundException('Step not found');
        }

        return await this.prisma.howItWorksStep.delete({ where: { id } });
    }

}
