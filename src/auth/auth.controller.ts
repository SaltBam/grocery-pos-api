import {
    Body,
    Controller,
    Logger,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { LoginDto, Role } from './types';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CookieService } from '../common/utils/cookie/cookie.service';
import { BaseResponse } from '../common/base/base.response';
import { Public, Roles } from './auth.decorator';
import 'cookie-parser';

@Controller('auth')
export class AuthController extends BaseController {
    constructor(
        private service: AuthService,
        private cookieService: CookieService,
    ) {
        super();
    }

    @Public()
    @Roles(Role.Unauthenticated)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshPayload, jwtPayload, user } =
            await this.service.login(dto);

        this.cookieService.createJwt(res, jwtPayload);
        this.cookieService.createRefresh(res, refreshPayload);
        this.cookieService.createDummy(res);

        Logger.log({ jwtPayload });
        return new BaseResponse({ user });
    }

    @Public()
    @Roles(Role.Unauthenticated)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const oldRefreshPayload = req.signedCookies['refresh'] as
            | string
            | undefined;

        if (!oldRefreshPayload) throw new Error();

        try {
            const { refreshId } = JSON.parse(oldRefreshPayload) as {
                refreshId: string;
            };

            if (!refreshId) throw new Error();

            const { refreshPayload, jwtPayload } =
                await this.service.refresh(refreshId);
            this.cookieService.createRefresh(res, refreshPayload);
            this.cookieService.createJwt(res, jwtPayload);
            this.cookieService.createDummy(res);
        } catch (err) {
            Logger.error(err);
            throw new UnauthorizedException('Please log in again');
        }

        return new BaseResponse();
    }

    @Public()
    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const refreshPayload = req.signedCookies['refresh'] as
            | string
            | undefined;

        if (!refreshPayload) throw new Error();

        try {
            const { refreshId } = JSON.parse(refreshPayload) as {
                refreshId: string;
            };

            if (!refreshId) throw new Error();

            await this.service.logout(refreshId);
        } catch (err) {
            Logger.warn('refreshPayload does not have valid content', err);
        }

        this.cookieService.removeJwt(res);
        this.cookieService.removeRefresh(res);
        this.cookieService.removeDummy(res);

        return new BaseResponse();
    }
}
