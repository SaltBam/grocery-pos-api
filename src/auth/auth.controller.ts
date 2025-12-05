import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { BaseController } from 'src/common/base/base.controller';
import { LoginDto, Role } from './types';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CookieService } from 'src/common/utils/cookie/cookie.service';
import { BaseResponse } from 'src/common/base/base.response';
import { Public, Roles } from './auth.decorator';

@Controller('auth')
export class AuthController extends BaseController {
    constructor(
        private service: AuthService,
        private cookieService: CookieService,
    ) { super() }
    
    @Public()
    @Roles(Role.Unauthenticated)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        if (req.signedCookies['refresh']) {
            return new BaseResponse();
        }

        const { refreshPayload, jwtPayload } = await this.service.login(dto);
        
        this.cookieService.createRefresh(res, refreshPayload);
        this.cookieService.createJwt(res, jwtPayload);
        
        return new BaseResponse();
    }
    
    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const refreshPayload = req.signedCookies['refresh'];

        let _id: string;
        try {
            ({ _id } = JSON.parse(refreshPayload));
            if (!_id)    throw new Error();

            //Note: this can throw a db error
            await this.service.logout(_id);
        } catch (err) {
            Logger.warn('refreshPayload does not have valid content');
        }

        this.cookieService.removeJwt(res);
        this.cookieService.removeRefresh(res);
        
        return new BaseResponse();
    }
}
