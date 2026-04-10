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

  // Get values from config or env
  const port = process.env.PORT || config.get('PORT') || 3000;
  const frontendUrl = config.get('FRONTEND_URL'); // Add this to your Env Vars

  app.useGlobalPipes(
    new ValidationPipe({ 
      transform: true, 
      whitelist: true, 
      transformOptions: { enableImplicitConversion: true } 
    })
  );
  
  app.useGlobalInterceptors(
    new TimingInterceptor(),
    new ResponseInterceptor()
  );
  
  app.use(cookieParser(config.get('COOKIE_SECRET')));

  app.enableCors({
    // Logic: allow localhost in dev, but use the real URL in production
    origin: process.env.NODE_ENV === 'production' ? frontendUrl : "http://localhost:5173",
    credentials: true
  });

  // Important for Railway to handle headers (like X-Forwarded-For) correctly
  app.set('trust proxy', true);
  
  // Start the server on 0.0.0.0
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server running on port: ${port}`);
}