import { BadRequestException, ForbiddenException, HttpException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto, updateJobDto } from './dto/create.job.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }


    private cleanUpdateData<T extends Record<string, any>>(
        data: T,
    ): Partial<T> {
        const cleaned: Partial<T> = {};

        for (const key in data) {
            const value = data[key];

            if (
                value !== undefined &&
                value !== null &&
                !(typeof value === 'string' && value.trim() === '') &&
                !(Array.isArray(value) && value.length === 0)
            ) {
                cleaned[key] = value;
            }
        }

        return cleaned;
    }

    async updateJob(
        userId: string,
        jobId: string,
        dto: updateJobDto,
        photos: Express.Multer.File[],
        documents: Express.Multer.File[],
    ) {
        // Find the job
        const job = await this.prisma.job.findUnique({
            where: { jobId },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        if (job.userId !== userId) {
            throw new ForbiddenException('You are not allowed to update this job');
        }

        // Prepare update data with proper type conversions
        const updateData = this.cleanUpdateData({
            jobTitle: dto.jobTitle,
            jobType: dto.jobType,
            projectDescription: dto.projectDescription,
            technicalRequermentAndCertification: dto.technicalRequirementsAndCertifications,
            elevatorType: dto.elevatorType,
            numberOfElevator: dto.numberOfElevator, // Already converted to number in controller
            capasity: dto.capacity,
            speed: dto.speed,
            address: dto.address,
            streetAddress: dto.streetAddress,
            city: dto.city,
            zipCode: dto.zipCode,
            estimitedBudget: dto.estimatedBudget,
        });

        // Handle photo uploads
        let photoUrls = job.photo;
        if (photos && photos.length > 0) {
            photoUrls = [];
            for (const photo of photos) {
                try {
                    const upload = await this.cloudinaryService.uploadFile(
                        photo,
                        'job/photos',
                    );
                    photoUrls.push(upload.secure_url);
                } catch (error) {
                    throw new BadRequestException(`Failed to upload photo: ${error.message}`);
                }
            }
        }

        // Handle document uploads
        let documentUrls = job.documents;
        if (documents && documents.length > 0) {
            documentUrls = [];
            for (const doc of documents) {
                try {
                    const upload = await this.cloudinaryService.uploadFile(
                        doc,
                        'job/documents',
                    );
                    documentUrls.push(upload.secure_url);
                } catch (error) {
                    throw new BadRequestException(`Failed to upload document: ${error.message}`);
                }
            }
        }

        // Update the job
        try {
            return await this.prisma.job.update({
                where: { jobId },
                data: {
                    ...updateData,
                    photo: photoUrls,
                    documents: documentUrls,
                },
            });
        } catch (error) {
            throw new BadRequestException(`Failed to update job: ${error.message}`);
        }
    }

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
            },
            include: {
                bids: true
            }
        });

        return result
    };


    async getSingleJobs(jobId: string) {
        const findJob = await this.prisma.job.findUnique({
            where: {
                jobId,
            },
            include: {
                bids: true,
                _count: { select: { bids: true } }
            },
        });

        if (!findJob) throw new NotFoundException("Job Not Found");

        return {
            totalBid: findJob._count.bids,
            ...findJob
        }

    };

    async pendingReview(jobId: string, elevatorUserId: string) {
        const findJob = await this.prisma.job.findFirst({
            where: {
                jobId: jobId,
            },
            include: {
                bids: true
            }
        });

        if (!findJob) {
            throw new Error("Job not found");
        }

        if (findJob?.jobStatus !== "INPROGRESS") throw new HttpException("This job is not yet ready for review. Only jobs that are currently in progress can be submitted for review.", 400)



        const acceptedBid = findJob.bids.find((bid) =>
            bid.userId === elevatorUserId &&
            bid.status === "ACCEPTED"
        );

        if (!acceptedBid) {
            throw new Error("You are not permitted to access this route");
        }

        await this.prisma.job.update({
            where: {
                jobId: jobId
            },
            data: {
                jobStatus: "PENDING_REVIEW"
            }
        });

        return null;

    };

    async compliteRequest(userId: string, jobId: string) {
        const result = await this.prisma.job.findFirst({
            where: {
                jobId: jobId
            }
        });

        if (!result) throw new NotFoundException("Job not found");

        if (result.userId !== userId) throw new NotAcceptableException("You are not permited for this route");
        console.log("Curent Job Status", result.jobStatus);
        const allowedStatuses = ["INPROGRESS", "PENDING_REVIEW"];

        if (!allowedStatuses.includes(result.jobStatus)) {
            throw new BadRequestException(
                `Job cannot be completed from status: ${result.jobStatus}`
            );
        }

        const data = await this.prisma.job.update({
            where: {
                jobId: jobId
            },
            data: {
                jobStatus: "COMPLITE"
            }
        })

        return data;

    };

    async jobManagementByAdmin(page: number = 1, limit: number = 10, searchTerm?: string) {
        const skip = (page - 1) * limit;

        const searchCondition = searchTerm && searchTerm.trim() !== ""
            ? {
                OR: [
                    {
                        jobTitle: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode },
                    },
                    {
                        projectDescription: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode },
                    },
                ],
            }
            : {};

        const total = await this.prisma.job.count({
            where: searchCondition,
        });

        const result = await this.prisma.job.findMany({
            skip,
            take: limit,
            where: searchCondition,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        bids: true
                    }
                },
                bids: {
                    include: {
                        user: true
                    },

                },
                user: {
                    select: {
                        userId: true,
                        email: true,
                        name: true
                    }
                }
            },

        });

        const totalPage = Math.ceil(total / limit);

        return {
            meta: {
                page,
                limit,
                total,
                totalPage,
            },
            data: result,
        };
    };

    async getAllBiddessCompanyByJobId(jobId: string) {
        const bids = await this.prisma.bid.findMany({
            where: {
                jobId: jobId
            },
            include: {
                user: {
                    select: {
                        userId: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        companyName: true,
                        businessLogo: true,
                        licenseInfo: true,
                        licenseNo: true,
                        companyDescription: true,
                        servicesType: true,
                        yearFounded: true,
                        numberOfEmployee: true,
                        website: true,
                        businessAddress: true,
                        stripeAccountId: true,
                        // Reviews info
                        reviewsReceived: {
                            select: {
                                rating: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate review count and average for each user
        const result = bids.map(bid => {
            const reviews = bid.user.reviewsReceived;
            const reviewCount = reviews.length;
            const avgRating =
                reviewCount > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                    : 0;

            return {
                bidId: bid.bidId,
                bidAmount: bid.bidAmount,
                user: {
                    ...bid.user,
                    reviewCount,
                    avgRating
                }
            };
        });

        return result;
    };

    async deleteJob(jobId: string, userId: string) {
        const deleteJob = await this.prisma.job.delete({
            where: {
                userId: userId,
                jobId: jobId
            }
        });

        if(!deleteJob) throw new NotFoundException("Job Not Found For Delete");

        return deleteJob

    }

}
