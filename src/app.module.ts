import { Module } from '@nestjs/common';
import { TypedConfigModule } from './common/typed-config/typed-config.module';
import { CookieModule } from './common/utils/cookie/cookie.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './auth/guards/jwt.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { RefreshTokenModule } from './auth/refresh-token/refresh-token.module';
import { GlobalFilter } from './common/global/global.filter';

@Module({
  imports: [
    TypedConfigModule, 
    CookieModule, 
    AuthModule, 
    RefreshTokenModule,
    UserModule,
    MongooseModule.forRoot(
      'mongodb://127.0.0.1/grocery'
    )
  ],
  controllers: [],
  providers: [
    {  
      provide: APP_GUARD,
      useClass: JWTAuthGuard
    },
    {  
      provide: APP_GUARD,
      useClass: RoleGuard
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter
    },
  ],
})
export class AppModule {}
