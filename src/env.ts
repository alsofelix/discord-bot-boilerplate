import { z } from "zod";

const envSchema = z.object({
  TOKEN: z.string(),
  CLIENT_ID: z.string(),
  GUILD_ID: z.string(),
  DATABASE_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
