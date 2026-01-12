import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { ISignUp } from './type/SignUpType';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private JwtService: JwtService) { }

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


    async signUp(data: ISignUp) {
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
            if (!data.companyName || !data.licenseInfo || !data.businessLogo) {
                throw new HttpException(
                    'Company Name, License Info, and Business Logo are required for ELEVATOR role',
                    400,
                );
            }

            userData.companyName = data.companyName;
            userData.licenseInfo = data.licenseInfo;
            userData.businessLogo = data.businessLogo;
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

}
