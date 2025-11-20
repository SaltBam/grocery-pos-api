import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginReq } from './types';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types/auth.types';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private config: TypedConfigService,
        private userService: UserService,
        private jwtService: JwtService,
        private refreshTokenService: RefreshTokenService,
    ) {}

    async login(loginReq: LoginReq)
    : Promise<{
        refreshPayload: string,
        jwtPayload: string
    }> {
        const { username, password } = loginReq;

        const userInfo = 
            await this.userService.checkCredentials(username, password);
        
        if (!userInfo) {
            throw new BadRequestException(
                `Username and Password do not match`
            );
        }

        const isActivated = await this.userService.checkActivated(username);
        if (!isActivated) {
            throw new UnauthorizedException(
                `Account is deactivated. Kindly contact the owner.`
            );
        }

        const refreshPayload = await this.refreshTokenService.create(userInfo._id);
        const jwtPayload = { username: userInfo.name, roles: userInfo.roles };
        
        return {
            refreshPayload: JSON.stringify(refreshPayload),
            jwtPayload: this.signJWT(jwtPayload)
        }            
    }

    async logout(refreshTokenId: Types.ObjectId): Promise<void> {
        await this.refreshTokenService.invalidate(refreshTokenId);
    }

    signJWT(payload: JWTPayload)
    : string {
        return this.jwtService.sign(
            payload, {
                expiresIn: this.config.get('JWT_EXPIRY'),
                secret: this.config.get('JWT_SECRET')
            }
        );
    }
}
