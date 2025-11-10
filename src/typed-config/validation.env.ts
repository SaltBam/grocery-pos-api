import * as zod from 'zod'

export const envSchema = zod.object({
    PORT: zod.coerce.number(),
});

export type EnvTypes = zod.infer<typeof envSchema>;