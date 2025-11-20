import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../auth.decorator';
import { JWTInvalidError, Role } from '../types';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector
  ) 
  { super(); }

  handleRequest<TUser=any>(
    err: any, user: any, info: any, context: ExecutionContext, status?: any
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride(
      IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]
    );
    
    Logger.log({isPublic, err, user});
    
    if (err || !user) { 
      if (isPublic)
        return { roles: Role.Unauthenticated } as any;
  
      throw new JWTInvalidError();
    }

    return user;
  }
}
