import * as zod from 'zod'

export const envSchema = zod.object({
    NODE_ENV: zod.string(),
    PORT: zod.coerce.number(),
    DOMAIN: zod.string(),
    COOKIE_SECRET: zod.string(),
    JWT_SECRET: zod.string(),
    JWT_EXPIRY: zod.coerce.number().positive(),
    REFRESH_EXPIRY: zod.coerce.number().positive(),
    EAN_COUNTER_ID: zod.string(),
    EAN_COUNTER_DIGITS: zod.coerce.number(),
    FRONTEND_URL: zod.string(),
});

export type EnvTypes = zod.infer<typeof envSchema>;