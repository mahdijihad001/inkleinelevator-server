import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { ISignUp } from './type/SignUpType';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import Stripe from 'stripe';
import { ChangePasswordDto } from './dto/user.request.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private JwtService: JwtService, private mailService: MailService, private CloudinaryService: CloudinaryService, @Inject('STRIPE') private stripe: Stripe) { }

    async constractorStripeAccount(email: string) {
        const account = await this.stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        return account.id;
    };

    async elevatorStripeAccountAcive(vendorStripeAccountId) {
        const accountLink = await this.stripe.accountLinks.create({
            account: vendorStripeAccountId,
            refresh_url: 'https://yourdomain.com/reauth',
            return_url: 'https://yourdomain.com/success',
            type: 'account_onboarding',
        });
        return accountLink.url
    }

    async hashText(text: string) {
        const hash = await bcrypt.hash(text, 10);
        return hash
    };

    async updateRt(userId: string, rt: string) {

        const hastRt = await this.hashText(rt);

        const update = await this.prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                refreshToken: hastRt
            }
        });

        return update

    }

    async getTokens(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User Not Found");

        const [at, rt] = await Promise.all([
            this.JwtService.signAsync({
                sub: user?.userId,
                email: user?.email,
                role: user?.role
            },
                {
                    secret: "at-secrate",
                    expiresIn: 60 * 60 * 24 * 7
                }
            ),
            this.JwtService.signAsync({
                sub: user?.userId,
                email: user?.email
            },
                {
                    secret: "rt-secrate",
                    expiresIn: 60 * 60 * 24 * 30
                }
            )

        ]);

        await this.updateRt(user?.userId, rt)

        return {
            accessToken: at,
            refreshToken: rt
        }

    }


    async hashPassword(password: string) {
        const data = bcrypt.hash(password, 10);
        return data
    }


    async signUp(data: ISignUp, files: {
        businessLogo: Express.Multer.File[],
        licenseInfo: Express.Multer.File[]
    }) {
        const isExist = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { phone: data.phone }
                ]
            },
        });

        if (isExist) {
            throw new HttpException("Email or Phone Already exist", 400);
        }

        const hashedPassword = await this.hashPassword(data.password);

        const userData: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            role: data.role,
        };

        if (data.role === 'ELEVATOR') {
            if (!data.companyName || !files.licenseInfo || !files.businessLogo) {
                throw new HttpException(
                    'Company Name, License Info, and Business Logo are required for ELEVATOR role',
                    400,
                );
            }

            const businessLogoUpload: any =
                await this.CloudinaryService.uploadFile(
                    files.businessLogo[0],
                    'business-logos',
                );

            const licenseInfoUpload: any =
                await this.CloudinaryService.uploadFile(
                    files.licenseInfo[0],
                    'licenses',
                );

            userData.companyName = data.companyName;
            userData.licenseInfo = licenseInfoUpload?.secure_url;
            userData.businessLogo = businessLogoUpload?.secure_url;
            userData.stripeAccountId = await this.constractorStripeAccount(data.email)
        }

        return this.prisma.user.create({ data: userData });
    }

    async signIn(data: { email: string, password: string }) {
        const findUser = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (!findUser) throw new HttpException("User Not Found", 404);

        const compairePassword = await bcrypt.compare(data.password, findUser.password);

        if (!compairePassword) throw new HttpException("Invalid Password", HttpStatus.FORBIDDEN);

        const tokens = await this.getTokens(findUser?.userId);

        return {
            user: findUser,
            tokens
        }
    }

    async logOutUser(userId: string) {
        await this.prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                refreshToken: null
            }
        });
    };

    async refreshToken(userId: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User Not Found");

        const compireRefreshToken = await bcrypt.compare(rt, user?.refreshToken as string);

        if (!compireRefreshToken) throw new HttpException("Invalid Refresh Token", 400);

        const tokens = this.getTokens(user?.userId);

        return tokens
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId,
            }
        });

        if (!user) throw new NotFoundException("User Not Found");


        const reviewStats = await this.prisma.review.aggregate({
            where: {
                revieweeId: user?.userId
            },
            _count: {
                reviewId: true
            },
            _avg: {
                rating: true
            }
        })

        const { password, refreshToken, otp ,...rest } = user;

        const reviewCount = reviewStats._count.reviewId;
        const reviewAvg = reviewStats._avg.rating;

        return {
            ...rest,
            reviewCount,
            reviewAvg
        }
    }

    async stripeElevatorAccountActive(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId,
                role: "ELEVATOR"
            }
        });

        if (!user) {
            throw new HttpException("Elevator Not Found", 404);
        }

        if (user && user?.role !== "ELEVATOR") {
            throw new HttpException("You are Not Elevator", 400);
        }

        const url = this.elevatorStripeAccountAcive(user?.stripeAccountId);
        return url;

    }

    async uploadProfile(userId: string, file: Express.Multer.File) {
        const user = await this.prisma.user.findUnique({
            where: { userId: userId },
        });

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        const uploadResult: any = await this.CloudinaryService.uploadFile(
            file,
            'user-profiles',
        );

        return this.prisma.user.update({
            where: { userId: userId },
            data: {
                profile: uploadResult?.secure_url,
            },
        });
    };


    async changePassword(
        userId: string,
        dto: ChangePasswordDto,
    ) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
        });

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

        if (!isMatch) {
            throw new HttpException('Old password is incorrect', 400);
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { userId },
            data: {
                password: hashedPassword,
            },
        });

        return null;
    }

    async sendOtpInUserEmail(email: string) {

        const findUser = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!findUser) throw new NotFoundException("User Not Found");

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await this.mailService.sendMail(
            email,
            'Reset Your Password',
            code,
        );

        const hashOtp = await bcrypt.hash(code, 10);

        await this.prisma.user.update({
            where: {
                email: email
            },
            data: {
                otp: hashOtp
            }
        })

        return {
            message: 'Verification code sent to email',
        };
    };


    async verifyOtp(email: string, otp: string) {
        const finduser = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!finduser) throw new NotFoundException("User Not Valid");

        if (!finduser.otp) throw new HttpException("please first sent a otp in your email", 400)

        const verifyOtp = await bcrypt.compare(otp, finduser.otp as string);

        if (!verifyOtp) throw new BadRequestException("Invalid Otp");

        const roken = await this.JwtService.sign(
            {
                sub: finduser.userId,
                email: finduser.email
            },
            {
                secret: "huywrfauirruhjhqrhoqrhoqhrq3r8qrafb347895utjfghje58utjg35b6vcxx4v6b",
                expiresIn: "10m"
            }
        );

        await this.prisma.user.update({
            where: { email },
            data: { otp: null }
        });

        return {
            message: "Otp Verifid Success",
            token: roken
        }
    }


    async resetPassword(token: string, password: string) {
        let payload: any;
        try {
            payload = await this.JwtService.verify(token, {
                secret: "huywrfauirruhjhqrhoqrhoqhrq3r8qrafb347895utjfghje58utjg35b6vcxx4v6b"
            });
        } catch (err) {
            throw new UnauthorizedException("Invalid or expired token");
        };

        const hashPassword = await bcrypt.hash(password, 10);

        await this.prisma.user.update({
            where: { userId: payload.sub },
            data: { password: hashPassword }
        });

        return {
            message: "Password changed successfully"
        };
    }

}
