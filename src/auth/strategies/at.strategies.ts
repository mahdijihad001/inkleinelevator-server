import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AtStrategie extends PassportStrategy(Strategy, "jwt") {
    constructor(private Prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: "at-secrate"
        });
    }

    async validate(payload: any) {

        const user = await this.Prisma.user.findUnique({
            where: {
                userId: payload.sub
            }
        });

        if (!user) throw new UnauthorizedException()

        return user
    }

}