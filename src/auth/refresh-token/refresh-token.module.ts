import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { AuthModule } from '../auth.module';
import { CookieModule } from 'src/common/utils/cookie/cookie.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: RefreshToken.name, schema: RefreshTokenSchema
    }]),
    forwardRef(() => AuthModule), 
    CookieModule
  ],
  providers: [
    RefreshTokenService,
  ],
  exports: [RefreshTokenService]
})
export class RefreshTokenModule {}
