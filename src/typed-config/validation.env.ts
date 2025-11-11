import * as zod from 'zod'

export const envSchema = zod.object({
    NODE_ENV: zod.string(),
    PORT: zod.coerce.number(),
    DOMAIN: zod.string(),
    COOKIE_SECRET: zod.string(),
});

export type EnvTypes = zod.infer<typeof envSchema>;