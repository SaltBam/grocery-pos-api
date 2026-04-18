import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types/auth.types';
import { TypedConfigService } from '../common/typed-config/typed-config.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
    constructor(
        @InjectConnection() private connection: Connection,
        private config: TypedConfigService,
        private userService: UserService,
        private jwtService: JwtService,
        private refreshTokenService: RefreshTokenService,
    ) {}

    async login(dto: LoginDto)
    : Promise<{
        refreshPayload: string,
        jwtPayload: string,
        user: {
            username: string,
        }
    }> {
        const { username, password } = dto;

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
                `Account is deactivated. Kindly contact the owner`
            );
        }

        const refreshId = await this.refreshTokenService
            .create(userInfo._id.toString());

        const jwtPayload = {
            userId: userInfo._id.toString(), 
            username: userInfo.name, 
            roles: userInfo.roles 
        };
        
        return {
            refreshPayload: JSON.stringify({refreshId}),
            jwtPayload: this.signJWT(jwtPayload),
            user: { username }
        }            
    }

    async refresh(oldRefreshId: string) {
        const {refreshId, jwtPayload} = await this.refreshTokenService.rotate(oldRefreshId)
        return {
            refreshPayload: JSON.stringify({refreshId}),
            jwtPayload: this.signJWT(jwtPayload),
        }
    }

    async logout(refreshTokenId: string): Promise<void> {
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
