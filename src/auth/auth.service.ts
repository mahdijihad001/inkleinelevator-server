import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { IUser } from './type/SignUpType';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async hashPassword(password) {
        const data = bcrypt.hash(password, 10);
        return data
    }


    async SignUp(data: IUser) {

        const isExist = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (isExist) {
            throw new HttpException(`${data.email} already exists`, 400);
        };

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
                    'Company Name, License Info and Business Logo are required for ELEVATOR role',
                    400,
                );
            }
            userData.companyName = data.companyName;
            userData.licenseInfo = data.licenseInfo;
            userData.businessLogo = data.businessLogo;
        };

        const newUser = await this.prisma.user.create({
            data: userData,
        });

        

        return newUser;
    };

    

}
