import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHeroDto } from './dto/content.management.dto';

@Injectable()
export class ContentManagementService {
    constructor(private prisma: PrismaService) { }


    async createHero(dto: CreateHeroDto) {
        const existing = await this.prisma.heroSection.findUnique({
            where: { heroKay: "HERO_KEY" },
        });

        if (existing) {
            throw new BadRequestException('Hero section already exists');
        }

        return await this.prisma.heroSection.create({
            data: {
                heroKay: "HERO_KEY",
                ...dto,
            },
        });
    }

    async getHero() {
        const result = await this.prisma.heroSection.findUnique({
            where: { heroKay: "HERO_KEY" },
        });
        if (!result) throw new NotFoundException("Hero Not Exist")
        return result
    }

    async updateHero(dto: CreateHeroDto) {
        const result = await this.prisma.heroSection.update({
            where: { heroKay: "HERO_KEY" },
            data: dto,
        });

        if (!result) throw new NotFoundException("Hero Not Exist");

        return result

    }


}
