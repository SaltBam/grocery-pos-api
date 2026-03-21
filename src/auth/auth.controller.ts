import { BadRequestException, Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { BaseController } from 'src/common/base/base.controller';
import { LoginDto, Role } from './types';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CookieService } from 'src/common/utils/cookie/cookie.service';
import { BaseResponse } from 'src/common/base/base.response';
import { Public, Roles } from './auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';

@Controller('auth')
export class AuthController extends BaseController {
    constructor(
        private service: AuthService,
        private cookieService: CookieService,
        private jwtService: JwtService,
        private config: TypedConfigService
    ) { super() }
    
    @Public()
    @Roles(Role.Unauthenticated)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshPayload, jwtPayload } = await this.service.login(dto);
        
        this.cookieService.createJwt(res, jwtPayload);
        this.cookieService.createRefresh(res, refreshPayload)
        Logger.log({jwtPayload})
        return new BaseResponse();
    }
    
    @Public()
    @Roles(Role.Unauthenticated)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({passthrough: true}) res: Response
    ) {
        Logger.log('REFRESH')
        const oldRefreshPayload = req.signedCookies['refresh']
        
        Logger.log('BEFORE TRY')
        try {
            const { refreshId } = JSON.parse(oldRefreshPayload)

            Logger.log({refreshId})
            if (!refreshId) throw new Error()

            const {refreshPayload, jwtPayload} = await this.service.refresh(refreshId)
            this.cookieService.createRefresh(res, refreshPayload)
            this.cookieService.createJwt(res, jwtPayload)
        } catch (err) {
            Logger.error(err)
            throw new BadRequestException('Please log in again')
        }

        return new BaseResponse();
    }

    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const refreshPayload = req.signedCookies['refresh'];
        Logger.log({refreshPayload})
        try {
            const { refreshId } = JSON.parse(refreshPayload)
            if (!refreshId) throw new Error()

            await this.service.logout(refreshId)
        } catch (err) {
            Logger.warn('refreshPayload does not have valid content');
        }

        this.cookieService.removeJwt(res);
        this.cookieService.removeRefresh(res);

        return new BaseResponse();
    }
}
