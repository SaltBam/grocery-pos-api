import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginReq } from './types';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types/auth.enum';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';

@Injectable()
export class AuthService {
    constructor(
        private config: TypedConfigService,
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async login(loginReq: LoginReq)
    : Promise<string> {
        const { username, password } = loginReq;

        const jwtPayload = 
            await this.userService.checkCredentials(username, password);
        
        if (!jwtPayload) {
            throw new BadRequestException(
                `Username and Password do not match`
            );
        }

        return this.signJWT(jwtPayload);
    }

    private signJWT(payload: JWTPayload)
    : string {
        return this.jwtService.sign(
            payload, {
                expiresIn: this.config.get('JWT_EXPIRY'),
                secret: this.config.get('JWT_SECRET')
            }
        );
    }
}
