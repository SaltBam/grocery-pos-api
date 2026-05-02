import * as zod from 'zod';

export const envSchema = zod.object({
    NODE_ENV: zod.enum(['dev', 'prod', 'stage', 'test']),
    PORT: zod.coerce
        .number()
        .int('Port must be an integer')
        .min(1, 'Port must be greater than 0')
        .max(65535, 'Port must be less than or equal to 65535')
        .default(3000),
    FRONTEND_URL: zod.url(
        'Frontend URL must be a valid URL including http:// or https://',
    ),
    DATABASE_URL: zod.url(
        'Database URL must be a valid URL including http:// or https://',
    ),
    DOMAIN: zod.string(),
    COOKIE_SECRET: zod.string(),
    JWT_SECRET: zod.string(),
    JWT_EXPIRY: zod.coerce.number().positive(),
    REFRESH_EXPIRY: zod.coerce.number().positive(),
    EAN_COUNTER_ID: zod.string(),
    EAN_COUNTER_DIGITS: zod.coerce.number(),
});

export type EnvTypes = zod.infer<typeof envSchema>;
