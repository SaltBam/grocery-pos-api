import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Types } from "mongoose";

export enum Role {
    Guest = 'guest',
    Clerk = 'clerk',
    Owner = 'owner',
    Unauthenticated = 'unauthenticated',
}

export class JWTPayload {
    userId: string
    username: string
    roles: Role[]
}

export type AuthUser = JWTPayload;

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthUser => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
    }
)