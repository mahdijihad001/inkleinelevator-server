import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RtStrategies extends PassportStrategy(Strategy, "rt-jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: "rt-secrate",
            passReqToCallback: true
        })
    };

    async validate(req: Request, payload: any) {
        const refreshToken = req.get("authorization")?.replace("Bearer ", "").trim();
        // const refreshToken = req.headers.authorization?.replace("Bearer ", "").trim();

        return {
            userId: payload.sub,
            refreshToken
        }

    }
}