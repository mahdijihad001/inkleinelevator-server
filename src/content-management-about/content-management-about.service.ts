import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAboutDto } from './dto/request.content-management-about.dto';

@Injectable()
export class ContentManagementAboutService {
    constructor(private prisma: PrismaService) { }

    async createAbout(dto: CreateAboutDto) {
        const exists = await this.prisma.aboutSection.findUnique({
            where: { aboutKey: "ABOUT_KEY" },
        });

        if (exists) {
            throw new BadRequestException('About section already exists');
        }

        return this.prisma.aboutSection.create({
            data: {
                aboutKey: "ABOUT_KEY",
                ...dto,
            },
        });
    }

    async getAbout() {
        const result = await this.prisma.aboutSection.findUnique({
            where: { aboutKey: "ABOUT_KEY" },
        });

        if (!result) throw new NotFoundException("About Not Exist")

        return result

    }

    async updateAbout(dto: CreateAboutDto) {
        const result = await this.prisma.aboutSection.update({
            where: { aboutKey: "ABOUT_KEY" },
            data: dto,
        });

        if (!result) throw new NotFoundException("About Not Exist")

        return result
    }


}
