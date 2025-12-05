import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TypedConfigService } from './common/typed-config/typed-config.service';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(TypedConfigService);

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true })
  );
  
  app.useGlobalInterceptors(
    new TimingInterceptor(),
    new ResponseInterceptor()
  );
  
  app.use(cookieParser(config.get('COOKIE_SECRET')));

  app.enableCors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true // if you plan to send cookies
  });

  app.set('trust proxy', true);
  
  await app.listen(config.get('PORT') ?? 3000);
  console.log(`🚀 Server running on http://localhost:${config.get('PORT') ?? 3000}`);

}

bootstrap();