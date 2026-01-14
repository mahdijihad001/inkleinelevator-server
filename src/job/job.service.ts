import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './dto/create.job.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class JobService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    async createJob(userId: string, dto: CreateJobDto, photos: Express.Multer.File[], documents: Express.Multer.File[]) {
        const photoUrls: string[] = [];
        const documentUrls: string[] = [];

        for (const photo of photos) {
            const upload = await this.cloudinaryService.uploadFile(
                photo,
                'job/photos',
            );
            photoUrls.push(upload.secure_url);
        }

        for (const doc of documents) {
            const upload = await this.cloudinaryService.uploadFile(
                doc,
                'job/documents',
            );
            documentUrls.push(upload.secure_url);
        }

        return this.prisma.job.create({
            data: {
                userId,
                jobTitle: dto.jobTitle,
                jobType: dto.jobType,
                projectDescription: dto.projectDescription,
                technicalRequermentAndCertification:
                    dto.technicalRequirementsAndCertifications,

                elevatorType: dto.elevatorType,
                numberOfElevator: dto.numberOfElevator,
                capasity: dto.capacity,
                speed: dto.speed,
                address: dto.address,
                streetAddress: dto.streetAddress,
                city: dto.city,
                zipCode: dto.zipCode,

                estimitedBudget: dto.estimatedBudget,
                photo: photoUrls,
                documents: documentUrls,
            },
        });

    }

    async getAllJob() {
        const result = await this.prisma.job.findMany({
            where: {
                paymentStatus: "PAID",
                jobStatus: "OPEN"
            }
        });

        if (!result) throw new NotFoundException("No Paind Open Job Dos't Available");

        return result;

    };


    async getMyAllJOb(userId: string) {
        const result = await this.prisma.job.findMany({
            where: {
                userId: userId
            }
        });

        return result
    }

}
