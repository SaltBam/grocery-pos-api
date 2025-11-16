import { Module } from '@nestjs/common';
import { TypedConfigModule } from './common/typed-config/typed-config.module';
import { CookieModule } from './common/utils/cookie/cookie.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './auth/jwt-auth.guard';
import { RoleGuard } from './auth/role.guard';

@Module({
  imports: [TypedConfigModule, CookieModule, AuthModule, UserModule,
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
  ],
})
export class AppModule {}
