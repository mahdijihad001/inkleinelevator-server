import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { ISignUp } from './type/SignUpType';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import Stripe from 'stripe';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private JwtService: JwtService, private CloudinaryService: CloudinaryService, @Inject('STRIPE') private stripe: Stripe) { }

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
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User Not Found");

        const { password, refreshToken, ...rest } = user;

        return rest
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

}
