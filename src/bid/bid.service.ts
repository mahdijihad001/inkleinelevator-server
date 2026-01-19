import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobBidProposalInterface } from './type/bid.type';
import { Prisma, BidStatus } from '@prisma/client';

@Injectable()
export class BidService {

    constructor(private prisma: PrismaService) { }


    async createBid(data: JobBidProposalInterface) {

        const checkBidRequest = await this.prisma.bid.findFirst({
            where: {
                jobId: data.jobId,
                status: "ACCEPTED"
            }
        });

        if (checkBidRequest) throw new HttpException("This job already has an accepted bid. You cannot place another bid", 400);

        const findBid = await this.prisma.bid.findFirst({
            where: {
                userId: data.userId,
                jobId: data.jobId
            }
        });

        if (findBid) throw new HttpException("Already bid for this job", 400);

        const bid = await this.prisma.bid.create({
            data: {
                userId: data.userId,
                jobId: data.jobId,
                bidAmount: data.bidAmount,
                timeline: data.timeline,
                completionTimeline: data.completionTimeline,
                brefProposal: data.brefProposal,
            }
        });

        return bid;
    }

    async deleteBid(userId: string, bidId: string) {

    };

    async acceptBid(userId: string, jobId: string, bidId: string) {
        const result = await this.prisma.bid.findFirst({
            where: {
                bidId: bidId
            },
            include: {
                job: true
            }
        });

        if (!result) throw new NotFoundException("Bid Not Found");

        if (result?.job?.userId !== userId) throw new HttpException("Access Decliene, You are not permitted access this route", 403);

        await this.prisma.bid.update({
            where: {
                bidId: bidId
            },
            data: {
                status: "ACCEPTED"
            }
        });

        await this.prisma.job.update({
            where: {
                jobId: jobId
            },
            data: {
                jobStatus: "INPROGRESS"
            }
        });

        return null;
    }

    async getAllBidByAdmin(page: number = 1, limit: number = 10, searchTerm?: string) {
        const skip = (page - 1) * limit;

        const validBidStatuses = Object.values(BidStatus);
        const searchNumber = Number(searchTerm);
        const searchCondition = searchTerm && searchTerm.trim() !== ""
            ? {
                OR: [
                    ...(isNaN(searchNumber) ? [] : [{ bidAmount: searchNumber }]),
                    { brefProposal: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                    ...(validBidStatuses.includes(searchTerm as any) ? [{ status: searchTerm as BidStatus }] : []),
                    {
                        user: {
                            OR: [
                                { name: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                                { email: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                                { companyName: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                            ],
                        },
                    },
                    {
                        job: {
                            OR: [
                                { jobTitle: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                                { projectDescription: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
                            ],
                        },
                    },
                ],
            }
            : {};


        const total = await this.prisma.bid.count({ where: searchCondition });


        const getAllBids = await this.prisma.bid.findMany({
            skip,
            take: limit,
            where: searchCondition,
            include: {
                user: {
                    select: {
                        userId: true,
                        name: true,
                        companyName: true,
                        email: true,
                        companyDescription: true,
                        _count: {
                            select: {
                                reviewsReceived: true
                            }
                        },

                    }
                },
                job: true,
            }
        });

        const bidsWithAvgReview = await Promise.all(getAllBids.map(async (bid) => {
            const avgReview = await this.prisma.review.aggregate({
                where: { revieweeId: bid.userId },
                _avg: { rating: true },
            });

            return {
                ...bid,
                avgRating: avgReview._avg.rating ?? 0
            };
        }));

        const totalPage = Math.ceil(total / limit);

        return {
            meta: { page, limit, total, totalPage },
            data: bidsWithAvgReview,
        };
    };

    async getSingleBidWithDetails(bidId: string) {
        const result = await this.prisma.bid.findFirst({
            where: {
                bidId: bidId
            },
            include: {
                job: {
                    include: {
                        user: true
                    }
                },
                user: {
                    select: {
                        userId: true,
                        companyName: true,
                        email: true,
                        name: true,
                        licenseNo: true,
                        licenseInfo: true
                    }
                }
            }
        });

        if (!result) throw new HttpException("Bid Not Found", 404);

        return result;

    };

    async getMyAllBid(page: number = 1, limit: number = 10, searchTerm: string, userId: string) {
        const skip = (page - 1) * limit;

        const whereCondition: Prisma.BidWhereInput = {
            userId: userId,
            AND: searchTerm && searchTerm.trim() !== ""
                ? [
                    {
                        job: {
                            OR: [
                                {
                                    jobTitle: {
                                        contains: searchTerm,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    jobType: {
                                        contains: searchTerm,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    projectDescription: {
                                        contains: searchTerm,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                ]
                : [],
        };

        const total = await this.prisma.bid.count({
            where: whereCondition,
        });

        const totalPage = Math.ceil(total / limit);

        const data = await this.prisma.bid.findMany({
            where: whereCondition,
            skip,
            take: limit,
            include: {
                job: {
                    select: {
                        jobId: true,
                        jobTitle: true,
                        jobType: true,
                        projectDescription: true,
                    },
                },
            },
        });

        return {
            meta: {
                total,
                totalPage,
                page,
                limit,
            },
            data
        };
    };

    async bidDelete(bidId: string, userId: string) {
        const result = await this.prisma.bid.delete({
            where: {
                bidId: bidId,
                userId: userId
            }
        });
        if (!result) throw new NotFoundException("Bid not found for delete");
        return result
    }

}
