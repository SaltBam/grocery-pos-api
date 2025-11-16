import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-jwt";
import { TypedConfigService } from "src/common/typed-config/typed-config.service";
import { JWTPayload } from "./types/auth.enum";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private config: TypedConfigService
    ) {
        super({
            jwtFromRequest: (req: Request) => {
                return req?.signedCookies?.jwt;
            },
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET')
        });
    }

    async validate(payload: JWTPayload): Promise<JWTPayload> {
        Logger.log({payload})
        return payload;
    }
}