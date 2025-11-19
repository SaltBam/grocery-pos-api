import * as zod from 'zod'

export const envSchema = zod.object({
    NODE_ENV: zod.string(),
    PORT: zod.coerce.number(),
    DOMAIN: zod.string(),
    COOKIE_SECRET: zod.string(),
    JWT_SECRET: zod.string(),
    JWT_EXPIRY: zod.coerce.number().positive(),
    REFRESH_EXPIRY: zod.coerce.number().positive(),
});

export type EnvTypes = zod.infer<typeof envSchema>;