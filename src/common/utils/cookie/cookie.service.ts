import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';

@Injectable()
export class CookieService {
    constructor(
        private config: TypedConfigService    
    ) {}

    create(
        res: Response,
        name: string, 
        payload: string, 
        options: {
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'strict' | 'lax';
            signed?: boolean;
            path?: string;
            domain?: string;
            maxAge: number;
        }
    ) {
        res.cookie(name, payload, {
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? true,
            //Note: check if should default to strict
            sameSite: options.sameSite ?? 'strict',
            signed: options.signed ?? true,
            path: options.path ?? '/',
            // domain: options.domain ?? `.${this.config.get('DOMAIN')}`,
            maxAge: options.maxAge,
        });
    }

    createSecure(
        res: Response,
        name: string, 
        payload: string, 
        maxAge: number,
        domain?: string,
        path?: string,
    ) {
        this.create(res, name, payload, { maxAge, domain, path });
    }

    removeSecure(
        res: Response,
        name: string, 
        sameSite?: 'strict' | 'lax',
        domain?: string,
        path?: string
    ) {
        res.clearCookie(name, {
            httpOnly: true,
            secure: true,
            //Note: check if this should be strict default
            sameSite: sameSite ?? 'strict',
            signed: true,
            // domain: domain ?? `.${this.config.get('DOMAIN')}`,
            path: path ?? '/',
        });
    }
}
