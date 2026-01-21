import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto, updateJobDto } from './dto/create.job.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';


interface GetAllJobOptions {
    search?: string;
    jobType?: string;
    page?: number;
    limit?: number;
}


interface GetMyJobOptions {
    search?: string;
    jobType?: string;
    page?: number;
    limit?: number;
}


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



        const result = this.prisma.job.create({
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
            }
        });

        await this.prisma.nitification.create({
            data: {
                description: `${(await result).jobTitle} Post`,
                logo: "JOB",
                title: "Post New JOb",
                userId: userId
            }
        })

        await this.prisma.recentActivity.create({
            data: {
                userId: userId,
                description: 'New Job Posted Successfully'
            }
        })

        return result

    }

    async getAllJob(options: GetAllJobOptions = {}) {
        const { search, jobType, page = 1, limit = 10 } = options;

        const where: any = {
            jobStatus: 'OPEN', // শুধু open jobs
        };

        // jobType filter
        if (jobType) {
            where.jobType = jobType;
        }

        // search filter (jobTitle বা projectDescription)
        if (search) {
            where.OR = [
                { jobTitle: { contains: search, mode: 'insensitive' } },
                { projectDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        // Find jobs + total count together for pagination
        const [jobs, totalCount] = await this.prisma.$transaction([
            this.prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.job.count({ where }),
        ]);

        if (!jobs || jobs.length === 0) {
            throw new NotFoundException('No Open Jobs Found');
        }

        return {
            total: totalCount,
            page,
            limit,
            jobs,
        };
    }

    async getMyAllJob1(userId: string, options: GetMyJobOptions = {}) {
        const { search, jobType, page = 1, limit = 10 } = options;

        const where: any = { userId };

        // filter by jobStatus
        if (jobType) {
            where.jobType = jobType;
        }

        // search filter: jobTitle / projectDescription
        if (search) {
            where.OR = [
                { jobTitle: { contains: search, mode: 'insensitive' } },
                { projectDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        // Find jobs + total count
        const [jobs, totalCount] = await this.prisma.$transaction([
            this.prisma.job.findMany({
                where,
                skip,
                take: limit,
                include: { bids: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.job.count({ where }),
        ]);

        if (!jobs || jobs.length === 0) {
            throw new NotFoundException("No Jobs Found");
        }

        return {
            total: totalCount,
            page,
            limit,
            jobs,
        };
    }


    async getMyAllJob(userId: string, options: GetMyJobOptions = {}) {
        const { search, jobType, page = 1, limit = 10 } = options;

        // Where condition তৈরি করুন
        const where: any = { userId };

        // JobType filter
        if (jobType) {
            where.jobType = jobType;
        }

        // Search filter - সঠিক উপায়ে OR condition
        if (search) {
            where.OR = [
                { jobTitle: { contains: search, mode: 'insensitive' } },
                { projectDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        try {
            // 1️⃣ Jobs + bids + bidder information fetch করুন
            const [jobs, totalCount] = await this.prisma.$transaction([
                this.prisma.job.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        bids: {
                            include: {
                                user: {
                                    select: {
                                        userId: true,
                                        name: true,
                                        companyName: true,
                                        verifidStatus: true,
                                        companyDescription: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                this.prisma.job.count({ where }),
            ]);

            // Empty result handle করুন - error throw না করে
            if (!jobs || jobs.length === 0) {
                return {
                    total: 0,
                    page,
                    limit,
                    jobs: [],
                };
            }

            // 2️⃣ সব bidder-এর userIds collect করুন
            const userIds = [
                ...new Set(jobs.flatMap(job => job.bids.map(bid => bid.userId))),
            ];

            // 3️⃣ Rating data fetch করুন (যদি bidders থাকে)
            let ratingMap = {};
            if (userIds.length > 0) {
                const ratings = await this.prisma.review.groupBy({
                    by: ['revieweeId'],
                    where: {
                        revieweeId: { in: userIds },
                    },
                    _avg: {
                        rating: true,
                    },
                    _count: {
                        rating: true,
                    },
                });

                // 4️⃣ Rating map তৈরি করুন
                ratingMap = Object.fromEntries(
                    ratings.map(r => [
                        r.revieweeId,
                        {
                            avgRating: r._avg.rating ?? 0,
                            totalRating: r._count.rating,
                        },
                    ])
                );
            }

            // 5️⃣ Jobs এর সাথে rating attach করুন
            const jobsWithBidderInfo = jobs.map(job => ({
                jobId: job.jobId,
                jobTitle: job.jobTitle,
                jobType: job.jobType,
                projectDescription: job.projectDescription,
                address: job.address,
                city: job.city,
                estimitedBudget: job.estimitedBudget,
                jobStatus: job.jobStatus,
                paymentStatus: job.paymentStatus,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
                numberOfElevator: job.numberOfElevator,
                bids: job.bids.map(bid => ({
                    bidId: bid.bidId,
                    bidAmount: bid.bidAmount,
                    timeline: bid.timeline,
                    status: bid.status,
                    brefProposal: bid.brefProposal,
                    user: {
                        userId: bid.user.userId,
                        name: bid.user.name,
                        companyName: bid.user.companyName,
                        companyDescription: bid.user.companyDescription,
                        verifidStatus: bid.user.verifidStatus,
                        avgRating: ratingMap[bid.userId]?.avgRating ?? 0,
                        totalRating: ratingMap[bid.userId]?.totalRating ?? 0,
                    },
                })),
            }));

            return {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                jobs: jobsWithBidderInfo,
            };
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw new InternalServerErrorException('Failed to fetch jobs');
        }
    }




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


        await this.prisma.nitification.create({
            data: {
                title: "Job Completion Request",
                description: `Your job "${(await result).jobTitle}" has been marked as completed. Please review and confirm.`,
                logo: "COMPLETED",
                userId: userId
            }
        });

        await this.prisma.recentActivity.create({
            data: {
                userId: userId,
                description: `Completion request submitted for job "${(await result).jobTitle}".`
            }
        });


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

        if (!deleteJob) throw new NotFoundException("Job Not Found For Delete");

        await this.prisma.nitification.create({
            data: {
                title: "Job Deleted",
                description: `Your job "${(await deleteJob).jobTitle}" has been deleted successfully.`,
                logo: "DELETE",
                userId: userId
            }
        });

        await this.prisma.recentActivity.create({
            data: {
                userId: userId,
                description: `Job "${(await deleteJob).jobTitle}" deleted successfully.`
            }
        });

        return deleteJob

    }

}
