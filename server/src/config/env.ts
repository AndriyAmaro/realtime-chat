import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6380),

  // JWT
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Client
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(5_242_880), // 5MB
  UPLOAD_DIR: z.string().default('uploads'),

  // Admin
  ADMIN_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  process.stderr.write('Invalid environment variables:\n')
  process.stderr.write(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2) + '\n')
  process.exit(1)
}

export const env = parsed.data
