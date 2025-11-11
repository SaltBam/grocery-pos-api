import { Module } from '@nestjs/common';
import { TypedConfigModule } from './typed-config/typed-config.module';
import { CookieModule } from './utils/cookie/cookie.module';

@Module({
  imports: [TypedConfigModule, CookieModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
