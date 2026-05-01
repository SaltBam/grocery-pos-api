import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export enum Role {
    Cashier = 'cashier',
    Owner = 'owner',
    InventoryManager = 'inventory manager',
    Unauthenticated = 'unauthenticated',
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
