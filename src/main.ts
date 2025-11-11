import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TypedConfigService } from './typed-config/typed-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(TypedConfigService);

  app.use(cookieParser(config.get('COOKIE_SECRET')));

  await app.listen(config.get('PORT') ?? 3000);
}

bootstrap();
