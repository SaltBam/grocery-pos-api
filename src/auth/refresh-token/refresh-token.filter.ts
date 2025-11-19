import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { JWTInvalidError } from '../types';
import { Types } from 'mongoose';
import { CookieService } from 'src/common/utils/cookie/cookie.service';
import { RefreshTokenService } from './refresh-token.service';
import { Request, Response } from 'express';

@Catch()
export class RefreshTokenFilter<T> implements ExceptionFilter {
  constructor(
    private cookieService: CookieService,
    private service: RefreshTokenService
  ) {}

  async catch(exception: JWTInvalidError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();

    const refreshCookie = req.signedCookies['refresh'];
    if (!refreshCookie) {
      throw new UnauthorizedException(
        `Please login again`
      );
    }

    let id: Types.ObjectId, token: string;

    try {
      ({ id, token } = JSON.parse(refreshCookie));
    } catch (err) {
      throw new UnauthorizedException(
        `Please login again`
      );
    }

    const { jwtPayload, refreshPayload } = 
      await this.service.rotate(id, token);
    
    const res: Response = ctx.getResponse();

    this.cookieService.createRefresh(res, refreshPayload);
    this.cookieService.createJwt(res, jwtPayload);

    res.redirect(req.originalUrl);
  }
}
