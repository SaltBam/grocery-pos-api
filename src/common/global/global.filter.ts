import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { RefreshTokenService } from '../../auth/refresh-token/refresh-token.service';
import { JWTInvalidError } from '../../auth/types';
import { CookieService } from '../utils/cookie/cookie.service';
import { toLowerCase } from 'zod';
import { MongoFilter } from './mongo.filter';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  constructor(
    private cookieService: CookieService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    Logger.log('GLOBAL FILTER');
    Logger.log({exception});

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    
    try {
      if (exception instanceof JWTInvalidError) {
        Logger.log('JWT FILTER')
        throw new UnauthorizedException('Please log in again');
      } else if ((exception as any)?.name?.toLowerCase().includes('mongo')) {
        Logger.log('MONGO FILTER')
        return MongoFilter.catch(exception);
      }
    } catch (err: any) {
      Logger.log('RECAUGHT GLOBAL FILTER')
      return this.sendResponse(res, req, err);
    }

    return this.sendResponse(res, req, exception);
  }

  private sendResponse(res: Response, req: Request, err: any) {
    Logger.log('FINAL ERROR: ', {err});

    const status = err?.getStatus?.() ?? err?.status ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    let message = err?.getResponse?.().message ?? 
      err.message ?? 'Internal Server Error';

    message = status === HttpStatus.INTERNAL_SERVER_ERROR ?
      'Internal Server Error' : message;

    res.status(status).json({
      statusCode: status,
      method: req.method,
      path: req.url,
      message,
    });
  }

  // private async handleJWT(exception: JWTInvalidError, res: Response, req: Request) {
  //     try {
  //       const refreshCookie = req.signedCookies['refresh'];
  //       if (!refreshCookie) {
  //         throw new UnauthorizedException(
  //           `Please login again`
  //         );
  //       }
        
  //       let _id: string, token: string;
        
  //       try {
  //         ({ _id, token } = JSON.parse(refreshCookie));
          
  //         if (!_id || !token) {
  //           throw new Error();
  //         }
  //       } catch (err) {
  //         throw new UnauthorizedException(
  //           `Please login again`
  //         );
  //       }
        
  //       const { jwtPayload, refreshPayload } = 
  //       await this.refreshTokenService.rotate(_id, token);
        
  //       this.cookieService.createRefresh(res, refreshPayload);
  //       this.cookieService.createJwt(res, jwtPayload);
        
  //       res.redirect(req.originalUrl);
  //     } catch (err) {
  //       throw err;
  //     }
  //   }
}
