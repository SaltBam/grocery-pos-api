import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export enum Role {
    Seller = 'SELLER',
    Adjuster = 'ADJUSTER',
    Restocker = 'RESTOCKER',
    UserManager = 'USER_MANAGER',
    Admin = 'ADMIN',
    Unauthenticated = 'UNAUTHENTICATED',
}

export class JWTPayload {
    userId!: string;
    username!: string;
    roles!: Role[];
}

export type AuthUser = JWTPayload;

interface RequestWithUser {
    user: AuthUser;
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthUser => {
        const req = ctx.switchToHttp().getRequest<RequestWithUser>();
        return req.user;
    },
);
