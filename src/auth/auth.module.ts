import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CookieModule } from 'src/common/utils/cookie/cookie.module';
import { UserModule } from 'src/user/user.module';
import { JWTStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    CookieModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTStrategy,
  ]
})
export class AuthModule {}
