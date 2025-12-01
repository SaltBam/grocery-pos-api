import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './refresh-token.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';
import { RefreshPayload } from './types';
import * as argon from 'argon2';
import { Role } from '../types';
import { AuthService } from '../auth.service';

type FoundRefresh = 
    Omit<RefreshToken, 'user'> &
    { user: {
        _id: Types.ObjectId,
        name: string,
        roles: Role[]
    }};

@Injectable()
export class RefreshTokenService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(RefreshToken.name) private model: Model<RefreshToken>,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private config: TypedConfigService,
    ) {}

    async create(userId: Types.ObjectId, expiry?: Date, session?: ClientSession)
    : Promise<RefreshPayload> {
        const token = randomBytes(32).toString('hex');
        const newExpiry = expiry ?? new Date(
            Date.now() + this.config.get('REFRESH_EXPIRY')
        );

        const [created] = await this.model.create([{
                token: await argon.hash(token),
                user: userId,
                expiry: newExpiry
            }], { session }
        );

        return { _id: created._id, token, userId };
    }

    async rotate(
        refreshTokenId: Types.ObjectId, token: string
    ): Promise<{refreshPayload: string, jwtPayload: string}> {
        const found = await this.model
            .findByIdAndDelete(refreshTokenId)
            .populate('user')
            .lean<FoundRefresh>();
        
        if (!found || !await this.checkValid(found, token)) {
            throw new UnauthorizedException(
                `Please login again`
            );
        }

        const refreshPayload = await this.create(found.user._id, found.expiry);
        const jwtPayload = {
            _id: found.user._id,
            username: found.user.name,
            roles: found.user.roles
        };

        return {
            refreshPayload: JSON.stringify(refreshPayload),
            jwtPayload: this.authService.signJWT(jwtPayload)
        }
    }

    async invalidate(_id: Types.ObjectId, session?: ClientSession): Promise<void> {
        await this.model
            .findByIdAndUpdate(
                _id,
                { isValid: false },
                { session }
            );
    }

    private async checkValid(
        refreshToken: FoundRefresh, token: string
    ): Promise<boolean> {
        return (
            !!refreshToken &&
            refreshToken.expiry.getTime() > Date.now() &&
            refreshToken.isValid &&
            await argon.verify(refreshToken.token, token)
        );
    }
}