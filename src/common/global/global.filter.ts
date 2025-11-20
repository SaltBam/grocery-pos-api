import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { RefreshTokenService } from 'src/auth/refresh-token/refresh-token.service';
import { JWTInvalidError } from 'src/auth/types';
import { CookieService } from '../utils/cookie/cookie.service';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  constructor(
    private refreshTokenService: RefreshTokenService,
    private cookieService: CookieService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    Logger.log('GLOBAL FILTER')
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    
    let status: any;
    let message: any;
    
    try {
      if (exception instanceof JWTInvalidError) {
        await this.handleJWT(exception, res, req);
        return;
      }
    } catch (err) {
      Logger.log('RECAUGHT GLOBAL FILTER')
      status = (err as any)?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = (err as any)?.message ?? 'Internal Server Error';
    }

    status =
      exception instanceof HttpException
        ? exception.getStatus()
        : status ?? HttpStatus.INTERNAL_SERVER_ERROR;

    message =
      exception instanceof HttpException
        ? exception.getResponse()
        : message ?? (exception as any)?.message ?? 'Internal server error';

    Logger.error(exception);

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.url,
      message,
    });
  }

  private async handleJWT(exception: JWTInvalidError, res: Response, req: Request) {
      try {
        Logger.log('REFRESH FILTER');

        const refreshCookie = req.signedCookies['refresh'];
        if (!refreshCookie) {
          throw new UnauthorizedException(
            `Please login again`
          );
        }
        
        let _id: Types.ObjectId, token: string;
        
        try {
          ({ _id, token } = JSON.parse(refreshCookie));
          
          if (!_id || !token) {
            throw new Error();
          }
        } catch (err) {
          throw new UnauthorizedException(
            `Please login again`
          );
        }
        
        const { jwtPayload, refreshPayload } = 
        await this.refreshTokenService.rotate(_id, token);
        
        this.cookieService.createRefresh(res, refreshPayload);
        this.cookieService.createJwt(res, jwtPayload);
        
        res.redirect(req.originalUrl);
      } catch (err) {
        throw err;
      }
    }
}
