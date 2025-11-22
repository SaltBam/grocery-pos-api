import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TypedConfigService } from './common/typed-config/typed-config.service';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(TypedConfigService);

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true })
  );
  
  app.useGlobalInterceptors(
    new TimingInterceptor(),
    new ResponseInterceptor()
  );
  
  app.use(cookieParser(config.get('COOKIE_SECRET')));

  await app.listen(config.get('PORT') ?? 3000);
  console.log(`🚀 Server running on http://localhost:${config.get('PORT') ?? 3000}`);

}

bootstrap();