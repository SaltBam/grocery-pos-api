import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { BaseController } from 'src/common/base/base.controller';
import { LoginReq, Role } from './types';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CookieService } from 'src/common/utils/cookie/cookie.service';
import { BaseResponse } from 'src/common/base/base.response';
import { Public, Roles } from './auth.decorator';
import { Types } from 'mongoose';

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
        @Body() loginReq: LoginReq,
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        if (req.signedCookies['refresh']) {
            Logger.log('already have')
            return new BaseResponse();
        }
        Logger.log('new have')

        const { refreshPayload, jwtPayload } = await this.service.login(loginReq);
        
        this.cookieService.createRefresh(res, refreshPayload);
        this.cookieService.createJwt(res, jwtPayload);
        
        return new BaseResponse();
    }
    
    @Roles(Role.Clerk, Role.Owner)
    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const refreshPayload = req.signedCookies['refresh'];

        let id: Types.ObjectId;
        try {
            ({ id } = JSON.parse(refreshPayload));
            if (!id)    throw new Error();

            //Note: this can throw a db error
            await this.service.logout(id);
        } catch (err) {
            Logger.warn('refreshPayload does not have valid content');
        }

        this.cookieService.removeJwt(res);
        this.cookieService.removeRefresh(res);
        
        return new BaseResponse();
    }
    
    @Roles(Role.Owner)
    @Get('test')
    test() {
        return new BaseResponse({
            message: 'Welcome'
        });
    }
}
