import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError, AppErrorResponse, ErrorCode } from '../errors';

@Catch()
export class GlobalFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        if (exception instanceof AppError) {
            res.status(exception.statusCode).json(
                exception.toResponse(req.url),
            );
            return;
        }

        if (
            exception instanceof Error &&
            exception.name === 'MongoServerError'
        ) {
            const mongoFilter = MongoFilter as {
                catch: (err: unknown, res: Response, req: Request) => void;
            };
            mongoFilter.catch(exception, res, req);
            return;
        }

        const errorResponse = this.buildErrorResponse(exception, req.url);
        res.status(errorResponse.statusCode).json(errorResponse);
    }

    private buildErrorResponse(
        exception: unknown,
        path: string,
    ): AppErrorResponse {
        const error = exception as {
            getStatus?: () => number;
            status?: number;
            getResponse?: () => unknown;
            message?: string;
        };

        const status =
            error.getStatus?.() ??
            error.status ??
            HttpStatus.INTERNAL_SERVER_ERROR;

        const response = error.getResponse?.();

        if (typeof response === 'object' && response !== null) {
            const respObj = response as { message?: string | string[] };
            const message = Array.isArray(respObj.message)
                ? respObj.message.join(', ')
                : (respObj.message ?? 'Internal Server Error');

            return {
                statusCode: status,
                error: ErrorCode.VALIDATION_INVALID_INPUT,
                message,
                timestamp: new Date().toISOString(),
                path,
                details: respObj.message !== message ? respObj : null,
            };
        }

        return {
            statusCode: status,
            error: ErrorCode.INTERNAL_ERROR,
            message:
                typeof response === 'string'
                    ? response
                    : 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path,
            details: null,
        };
    }
}

class MongoFilter {
    static catch(err: unknown, res: Response, req: Request) {
        const error = err as { code?: unknown };
        if (Number(error.code) === 11000) {
            const duplicateError = DuplicateError.createFromMongo(err);
            res.status(duplicateError.statusCode).json(
                duplicateError.toResponse(req.url),
            );
            return;
        }

        const internalError = new AppError(
            ErrorCode.INTERNAL_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Database error',
            err,
        );
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            internalError.toResponse(req.url),
        );
    }
}

class DuplicateError extends AppError {
    constructor(message: string, details: unknown = null) {
        super(
            ErrorCode.PRODUCT_DUPLICATE,
            HttpStatus.BAD_REQUEST,
            message,
            details,
        );
    }

    static createFromMongo(err: unknown): DuplicateError {
        const error = err as {
            name?: string;
            writeErrors?: Array<{
                err?: {
                    op?: { q?: { _id?: unknown }; _id?: unknown };
                    errmsg?: string;
                };
            }>;
            errorResponse?: { errmsg?: string };
        };

        const baseErrMsg = 'Already exists';
        const getKey = (origMsg: string) =>
            origMsg.split('dup key: { ')[1]?.split(':')[0] ?? 'unknown';

        let details: unknown;

        if (error.name === 'MongoBulkWriteError') {
            details = error.writeErrors?.map(({ err: writeErr }) => ({
                msg: baseErrMsg,
                _id: writeErr?.op?.q?._id ?? writeErr?.op?._id,
                property: getKey(writeErr?.errmsg ?? ''),
            }));
        } else {
            details = [
                {
                    msg: baseErrMsg,
                    property: getKey(error.errorResponse?.errmsg ?? ''),
                },
            ];
        }

        return new DuplicateError(baseErrMsg, details);
    }
}
