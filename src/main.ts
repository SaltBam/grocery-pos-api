import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TypedConfigService } from './common/typed-config/typed-config.service';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(helmet());

    const config = app.get(TypedConfigService);
    // const isProd = config.get('NODE_ENV') === 'prod';

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
            /* uncomment if frontend relies on api error messages */
            // disableErrorMessages: isProd,
        }),
    );

    app.useGlobalInterceptors(new TimingInterceptor());
    app.use(cookieParser(config.get('COOKIE_SECRET')));

    app.enableCors({
        origin: config.get('FRONTEND_URL'),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    });

    if (config.get('NODE_ENV') === 'prod') {
        app.set('trust proxy', 1);
    }

    app.enableShutdownHooks();

    const port = config.get('PORT') ?? process.env.PORT;
    await app.listen(port, '0.0.0.0');

    logger.log(
        `API running on port: ${port}, in ${config.get('NODE_ENV')} mode`,
    );
}

void bootstrap();
