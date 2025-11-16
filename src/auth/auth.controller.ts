import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { BaseController } from 'src/common/base/base.controller';
import { LoginReq, Role } from './types';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CookieService } from 'src/common/utils/cookie/cookie.service';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';
import { BaseResponse } from 'src/common/base/base.response';
import { Public, Roles, ROLES_KEY } from './auth.decorator';

@Public()
@Controller('auth')
export class AuthController extends BaseController {
    constructor(
        private service: AuthService,
        private config: TypedConfigService,
        private cookieService: CookieService,
    ) { super() }
    
    @Roles(Role.Unauthenticated)
    @Post('login')
    async login(
        @Body() loginReq: LoginReq,
        @Res({ passthrough: true }) res: Response
    ) {
        const payload = await this.service.login(loginReq);
        
        this.cookieService.createSecure(
            res, 'jwt', payload, this.config.get('JWT_EXPIRY'),
        );
        
        return new BaseResponse();
    }
    
    @Roles(Role.Clerk, Role.Owner)
    @Post('logout')
    logout(
        @Res({ passthrough: true }) res: Response
    ) {
        this.cookieService.removeSecure(
            res, 'jwt'
        );

        return new BaseResponse
    }

    @Roles(Role.Owner)
    @Get('test')
    test() {
        return new BaseResponse({
            message: 'Welcome'
        });
    }
}
