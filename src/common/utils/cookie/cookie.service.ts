import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';

@Injectable()
export class CookieService {
    constructor(
        private config: TypedConfigService    
    ) {}

    createSecure(
        res: Response,
        name: string, 
        payload: string, 
        maxAge: number,
        domain?: string,
        path?: string,
    ) {
        res.cookie(name, payload, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            signed: true,
            maxAge,
            path: path ?? '/',
            // domain: domain
        })
    }

    removeSecure(
        res: Response,
        name: string, 
        domain?: string,
        path?: string
    ) {
        res.clearCookie(name, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            signed: true,
            // domain: domain ?? `.${this.config.get('DOMAIN')}`,
            path: path ?? '/',
        });
    }

    createRefresh(res: Response, payload: string) {
        this.createSecure(
            res, 'refresh', payload, 
            this.config.get('REFRESH_EXPIRY')
        );
    }

    removeRefresh(res: Response) {
        this.removeSecure(res, 'refresh');
    }

    createJwt(res: Response, payload: string) {
        this.createSecure(
            res, 'jwt', payload, 
            this.config.get('JWT_EXPIRY')
        );
    }

    removeJwt(res: Response) {
        this.removeSecure(res, 'jwt');
    }
}
