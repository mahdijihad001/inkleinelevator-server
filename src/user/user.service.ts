import { HttpException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }


    async getAllUserByAdmin(
        page: number = 1,
        limit: number = 10,
        userType?: 'USER' | 'ELEVATOR' | 'ADMIN',
        searchTerm?: string
    ) {
        const skip = (page - 1) * limit;

        const whereCondition: Prisma.UserWhereInput = {
            ...(userType ? { role: userType } : {}),
            ...(searchTerm && searchTerm.trim() !== ''
                ? {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { companyName: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const total = await this.prisma.user.count({
            where: whereCondition,
        });


        const users = await this.prisma.user.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                userId: true,
                name: true,
                email: true,
                role: true,
                companyName: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        jobs: true,
                        bids: true,
                        reviewsReceived: true,
                    },
                },
            },
        });


        const usersWithAvgRating = await Promise.all(
            users.map(async (user) => {
                const avgReview = await this.prisma.review.aggregate({
                    where: { revieweeId: user.userId },
                    _avg: { rating: true },
                });

                return {
                    ...user,
                    avgRating: avgReview._avg.rating ?? 0,
                };
            })
        );

        const totalPage = Math.ceil(total / limit);

        return {
            meta: {
                page,
                limit,
                total,
                totalPage,
            },
            data: usersWithAvgRating,
        };
    };

    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
        });

        if (!user) {
            throw new NotAcceptableException("User Not Found");
        }

        await this.prisma.user.delete({
            where: { userId },
        });

        return {
            message: "User Profile Deleted Successfully",
        };
    };

    async updateUserVerifidStatusByAdmin(userId: string, statusType: "VERIFID" | "SUSPEND" | "DECLINT" | "REQUEST") {
        const update = await this.prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                verifidStatus: statusType
            }
        });
        if (!update) throw new NotFoundException("User not found");
        return update;
    };

    async updateUserProfile(userId: string, payload: Partial<User>) {

        const userExists = await this.prisma.user.findUnique({
            where: { userId },
        });

        if (!userExists) {
            throw new NotFoundException("User not found");
        };

        // const findEmail = await this.prisma.user.findUnique({
        //     where: {
        //         email: payload.email
        //     }
        // });

        // if (!findEmail) {
        //     throw new HttpException("Email Already Exist", 400)
        // }

        const finphone = await this.prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if (finphone) {
            throw new HttpException("Phone Already Exist", 400)
        }

        const updateData: Prisma.UserUpdateInput = {};

        Object.entries(payload).forEach(([key, value]) => {
            if (
                value !== undefined &&
                value !== null &&
                !(typeof value === "string" && value.trim() === "")
            ) {
                updateData[key] = value;
            }
        });


        if (Object.keys(updateData).length === 0) {
            return userExists;
        };
        const updatedUser = await this.prisma.user.update({
            where: { userId },
            data: updateData,
        });

        return updatedUser;
    };


    // async activeJobs(userId: string) {
    //     const result = await this.prisma.job.findMany({
    //         where: {
    //             userId: userId,
    //             jobStatus: {
    //                 notIn: ["COMPLITE", "DECLINED"]
    //             }
    //         },
    //         include: {
    //             bids: {
    //                 include: {
    //                     user: true
    //                 }
    //             }
    //         }
    //     });

    //     return result;

    // };


    async activeJobs(userId: string) {
        const result = await this.prisma.job.findMany({
            where: {
                userId,
                jobStatus: {
                    notIn: ["COMPLITE", "DECLINED"],
                },
            },
            include: {
                bids: {
                    include: {
                        user: {
                            include: {
                                _count: {
                                    select: {
                                        reviewsReceived: true,
                                    },
                                },
                                reviewsReceived: {
                                    select: {
                                        rating: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return result.map(job => ({
            ...job,
            bids: job.bids.map(bid => {
                const ratings = bid.user.reviewsReceived.map(r => r.rating);
                const ratingCount = ratings.length;
                const averageRating = ratingCount
                    ? ratings.reduce((a, b) => a + b, 0) / ratingCount
                    : null;

                return {
                    ...bid,
                    user: {
                        ...bid.user,
                        averageRating,
                        ratingCount,
                    },
                };
            }),
        }));
    }

    async rcentActivity(userId: string) {
        const result = await this.prisma.nitification.findMany({
            where: {
                userId: userId
            },
            take: 10,
            select: {
                description: true,
                title: true,
                createdAt: true,
                notificationId: true,
                logo: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return result
    };


    async elevetorAllActiveJobs(userId: string) {
        const result = await this.prisma.bid.findMany({
            where: {
                userId: userId,
                status: "ACCEPTED"
            },
            include: {
                job: true
            }
        });

        return result;
    };


    async myAllRecentBid(userId: string) {
        const result = await this.prisma.bid.findMany({
            where: {
                userId: userId
            },
            include: {
                job: true
            }
        });

        return result;
    };



    async userDashboardAnalytics(userId: string) {
        const [
            totalCompleteJob,
            totalActiveJob,
            totalBidCount,
            totalInvestmentResult
        ] = await Promise.all([
            this.prisma.job.count({
                where: { userId, jobStatus: "COMPLITE" },
            }),

            this.prisma.job.count({
                where: { userId, jobStatus: { notIn: ["DECLINED", "COMPLITE"] } },
            }),

            this.prisma.bid.count({
                where: { job: { userId } },
            }),

            this.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    userId,
                    status: "PAID",
                    releaseStatus: { not: "RELESE" }
                },
            }),
        ]);

        return {
            totalCompleteJob,
            totalActiveJob,
            totalBidCount,
            totalInvestment: totalInvestmentResult._sum.amount ?? 0,
        };
    }

    async getUserAndElevetorActivity(userId: string) {
        const result = await this.prisma.recentActivity.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        });

        return result;
    };


    async elevetorDashboardAnalytics(userId: string) {
        const totalBid = await this.prisma.bid.count({
            where: {
                userId: userId
            }
        });

        const jobCount = await this.prisma.job.count({
            where: {
                jobStatus: { in: ['PENDING_REVIEW', 'INPROGRESS'] },
                bids: {
                    some: { status: 'ACCEPTED' },
                },
            },
        });

        const userRatingResult = await this.prisma.review.aggregate({
            _avg: { rating: true },
            where: { revieweeId: userId },
        });

        const totalPaymentResult = await this.prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                user: {
                    bids: {
                        some: {
                            userId: userId,
                            status: 'ACCEPTED',
                            job: { jobStatus: 'COMPLITE' }
                        },
                    },
                },
            },
        });

        // Extract total
        const totalPayment = totalPaymentResult._sum.amount ?? 0;


        return {
            totalBid,
            jobCount,
            userRatingResult,
            totalRevenew: totalPayment
        }

    };


    async getAllRecentActivityForAdmin() {
        const result = await this.prisma.recentActivity.findMany({
            take: 7,
            orderBy: {
                createdAt: "desc"
            }
        });

        return result;
    };


    async getAllAdminDashboardAnalytics() {
        const totalUser = await this.prisma.user.count();

        const totalActiveJobs = await this.prisma.job.count({
            where: {
                jobStatus: {
                    notIn: ["DECLINED", "COMPLITE"],
                },
            },
        });

        const totalBid = await this.prisma.bid.count();

        const paymentSum = await this.prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: "PAID",
                releaseStatus: "RELESE",
            },
        });

        const totalPaymentAmount = paymentSum._sum.amount || 0;
        const totalPlatformRevenue = totalPaymentAmount * 0.1;


        const totalJob = await this.prisma.job.count();

        const totalOpenJob = await this.prisma.job.count({
            where: {
                jobStatus: "OPEN"
            }
        });

        const totalpendingBid = await this.prisma.bid.count({
            where: {
                status: "PENDING_REVIEW"
            }
        });

        const avgBidAmount = await this.prisma.bid.aggregate({
            _avg: {
                bidAmount: true,
            },
            where: {
                status: "ACCEPTED",
            },
        });

        const acceptedBidAvg = avgBidAmount._avg.bidAmount || 0;


        const totalIncrowPayment = await this.prisma.payment.aggregate({
            where: {
                status: 'PAID',
                releaseStatus: {
                    not: 'REVIEW',
                },
            },
            _sum: {
                amount: true,
            },
        });

        const totalIncrowPaymentAmount = totalIncrowPayment._sum.amount || 0;

        const totalPlatformRevenew = totalIncrowPaymentAmount * 0.10

        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const releasedPayments = await this.prisma.payment.aggregate({
            where: {
                status: 'PAID',
                releaseStatus: 'RELESE',
            },
            _sum: {
                amount: true,
            },
        });

        const totalReleasedAmount = releasedPayments._sum.amount || 0;

        //  90% calculation
        const toBeRelesed = totalReleasedAmount * 0.90;


        const releasedLast24h = await this.prisma.payment.aggregate({
            where: {
                status: 'PAID',
                releaseStatus: 'RELESE',
                createdAt: {
                    gte: last24Hours,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const totalReleased24h = releasedLast24h._sum.amount || 0;

        //  90% calculation
        const payout90Percent = totalReleased24h * 0.9;

        //  10% platform fee
        const platformFee10Percent = totalReleased24h * 0.1;


        return {

            dashboard: {
                totalUser,
                totalActiveJobs,
                totalBid,
                totalPlatformRevenue,
            },

            jobsManagements: {
                totalValue: totalPaymentAmount,
                totalJob,
                totalOpenJob,
                totalBid
            },


            bidsManagements: {
                totalBid,
                totalpendingBid,
                platformFee: totalPlatformRevenue,
                avgBidAmount: acceptedBidAvg,
            },

            payments: {
                inEscrow: totalIncrowPaymentAmount,
                totalPlatformRevenew,
                toBeRelesed,
                relesepayment: {
                    constructorGet: payout90Percent,
                    platformGet: platformFee10Percent,
                    totalRelesed: totalReleased24h
                }
            }

        };
    }

    async shortConstructorListForApproval() {
        const result = await this.prisma.user.findMany({
            where: {
                role: "ELEVATOR",
                verifidStatus: "REQUEST"
            },
            take: 7,
            orderBy: {
                createdAt: "asc"
            }
        });

        return result
    }



}
