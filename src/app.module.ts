import { Module } from '@nestjs/common';
import { TypedConfigModule } from './common/typed-config/typed-config.module';
import { CookieModule } from './common/utils/cookie/cookie.module';

@Module({
  imports: [TypedConfigModule, CookieModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
