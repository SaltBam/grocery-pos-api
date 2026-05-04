import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTInvalidError } from '../../auth/types';
import { MongoFilter } from './mongo.filter';

@Catch()
export class GlobalFilter implements ExceptionFilter {
    constructor() {}

    catch(exception: unknown, host: ArgumentsHost): void {
        Logger.log('GLOBAL FILTER');
        Logger.log({ exception });

        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        try {
            if (exception instanceof JWTInvalidError) {
                Logger.log('JWT FILTER');
                throw new UnauthorizedException('Please log in again');
            } else if (
                (
                    (exception as { name?: string }).name?.toLowerCase() ?? ''
                ).includes('mongo')
            ) {
                Logger.log('MONGO FILTER');
                return MongoFilter.catch(exception);
            }
        } catch (err: unknown) {
            Logger.log('RECAUGHT GLOBAL FILTER');
            return this.sendResponse(res, req, err);
        }

        return this.sendResponse(res, req, exception);
    }

    private sendResponse(res: Response, req: Request, err: unknown) {
        Logger.log('FINAL ERROR: ', { err });

        const error = err as {
            getStatus?: () => number;
            status?: number;
            getResponse?: () => { message?: string };
            message?: string;
        };

        const status =
            error.getStatus?.() ??
            error.status ??
            HttpStatus.INTERNAL_SERVER_ERROR;

        let message =
            error.getResponse?.().message ??
            error.message ??
            'Internal Server Error';

        message =
            status === (HttpStatus.INTERNAL_SERVER_ERROR as number)
                ? 'Internal Server Error'
                : message;

        res.status(status).json({
            statusCode: status,
            method: req.method,
            path: req.url,
            message,
        });
    }
}
