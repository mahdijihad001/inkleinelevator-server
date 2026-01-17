import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from 'generated/prisma/client';
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
            message: "User Deleted Successfully",
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
    }

}
