import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name, { timestamp: true });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = process.hrtime();

    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    const http = context.switchToHttp();
    const request = http.getRequest();
    const method = request?.method || '';
    const url = request?.url || '';

    const logTime = () => {
      const duration = process.hrtime(start);
      const durationMs = (duration[0] * 1000 + duration[1] / 1_000_000).toFixed(2);
      this.logger.log(`\n\t[${method}] ${url} -> ${controller}.${handler}() took ${durationMs}ms\n\n\n`);
    };

    return next.handle().pipe(
      tap(() => logTime()),
      catchError(err => {
        logTime();
        throw err;
      })
    );
  }
}