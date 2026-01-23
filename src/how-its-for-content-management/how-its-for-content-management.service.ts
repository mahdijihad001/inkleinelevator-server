import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHowItsForCardDto, CreateHowItsForDto, UpdateHowItsForCardDto, UpdateHowItsForDto } from './dto/how-its-for-content-management.request.dto';

@Injectable()
export class HowItsForContentManagementService {

    constructor(private prisma: PrismaService) { }


    async create(dto: CreateHowItsForDto) {
        const check = await this.prisma.howItsFor.findFirst({
            where: {
                how_its_for_key: "HOW_ITS_FOR"
            }
        });

        if (check) throw new BadRequestException("Already Exist this Section Content");

        return await this.prisma.howItsFor.create({
            data: {
                how_its_for_key: "HOW_ITS_FOR",
                label: dto.label,
                title: dto.title,
                subtitle: dto.subtitle,
            },
        });
    }


    async getSection() {
        const find = await this.prisma.howItsFor.findFirst({
            where: {
                how_its_for_key: "HOW_ITS_FOR"
            },
            include: {
                audiences: true
            }
        });

        if (!find) throw new NotFoundException("This Section Not create Please create This Section Content");

        return find

    }

    async update(dto: UpdateHowItsForDto) {
        const section = await this.prisma.howItsFor.findFirst({
            where: {
                how_its_for_key: 'HOW_ITS_FOR',
            },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        return this.prisma.howItsFor.update({
            where: {
                sectionId: section.sectionId,
            },
            data: {
                label: dto.label,
                title: dto.title,
                subtitle: dto.subtitle,
            },
        });
    }

    async createCard(dto: CreateHowItsForCardDto) {
        const findSection = await this.prisma.howItsFor.findFirst({
            where: {
                how_its_for_key: 'HOW_ITS_FOR',
            },
        });

        if (!findSection) {
            throw new BadRequestException('HOW_ITS_FOR section not found');
        }

        return this.prisma.howItsForCard.create({
            data: {
                sectionId: findSection.sectionId,
                type: dto.type,
                cardTitle: dto.cardTitle,
                cardSubtitle: dto.cardSubtitle,
                bulletText: dto.bulletText,
            },
        });
    }


    async updateCard(audienceId: string, dto: UpdateHowItsForCardDto) {
        const card = await this.prisma.howItsForCard.findUnique({
            where: { audienceId },
        });

        if (!card) {
            throw new NotFoundException('Card not found');
        }

        return this.prisma.howItsForCard.update({
            where: { audienceId },
            data: {
                type: dto.type,
                cardTitle: dto.cardTitle,
                cardSubtitle: dto.cardSubtitle,
                bulletText: dto.bulletText,
            },
        });
    }


}
