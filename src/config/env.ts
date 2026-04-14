import { z } from 'zod';

const envSchema = z.object({
  // MCP API key — the single secret users need to connect
  MCP_API_KEY: z.string().min(1),

  // Transport: set MCP_PORT to enable HTTP mode, otherwise stdio
  MCP_PORT: z.coerce.number().int().positive().optional(),

  // Choiz admin credentials
  CHOIZ_ADMIN_EMAIL: z.string().email(),
  CHOIZ_ADMIN_PASSWORD: z.string().min(1),

  // Service base URLs
  LOGIN_CORE_BASE_URL: z.string().url(),
  CHOIZ_CORE_BASE_URL: z.string().url(),
  MY_ACCOUNT_CORE_BASE_URL: z.string().url(),

  // Service-to-service API keys
  LOGIN_CORE_API_KEY: z.string().min(1),
  CHOIZ_CORE_API_KEY: z.string().min(1),
  MY_ACCOUNT_CORE_API_KEY: z.string().min(1),
  CHECKOUT_API_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  return parsed.data;
}
