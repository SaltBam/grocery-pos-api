export enum Role {
    Guest = 'guest',
    Clerk = 'clerk',
    Owner = 'owner',
    Unauthenticated = 'unauthenticated',
}

export class JWTPayload {
    username: string
    roles: Role[]
}