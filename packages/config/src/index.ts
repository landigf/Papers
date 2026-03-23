import path from "node:path"
import { z } from "zod"

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue
  }

  return value !== "false"
}

const configSchema = z.object({
  DATABASE_URL: z.string().optional(),
  PGLITE_DATA_DIR: z.string().default(path.resolve(process.cwd(), "packages/db/.data")),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),
  PAPERS_USE_DEMO_DATA: z.string().optional(),
  PAPERS_DEFAULT_HANDLE: z.string().default("demo-researcher"),
  PAPERS_ORCID_DISCOVERY_URL: z
    .string()
    .default("https://orcid.org/.well-known/openid-configuration"),
  PAPERS_ORCID_CLIENT_ID: z.string().optional(),
  PAPERS_ORCID_CLIENT_SECRET: z.string().optional(),
  PAPERS_ORCID_SCOPES: z.string().default("openid,/authenticate"),
  PAPERS_R2_ACCOUNT_ID: z.string().optional(),
  PAPERS_R2_ACCESS_KEY_ID: z.string().optional(),
  PAPERS_R2_SECRET_ACCESS_KEY: z.string().optional(),
  PAPERS_R2_BUCKET: z.string().optional(),
  PAPERS_R2_PUBLIC_BASE_URL: z.string().optional(),
  PAPERS_XAI_API_KEY: z.string().optional(),
  PAPERS_XAI_MODEL: z.string().default("grok-4-1-fast"),
  PAPERS_XAI_BASE_URL: z.string().default("https://api.x.ai/v1"),
  TRIGGER_SECRET_KEY: z.string().optional(),
  TRIGGER_PROJECT_REF: z.string().optional(),
})

export type PapersConfig = Omit<z.infer<typeof configSchema>, "PAPERS_USE_DEMO_DATA"> & {
  PAPERS_USE_DEMO_DATA: boolean
}

export function getPapersConfig(env: NodeJS.ProcessEnv = process.env): PapersConfig {
  const parsed = configSchema.parse(env)

  return {
    ...parsed,
    PAPERS_USE_DEMO_DATA: parseBoolean(parsed.PAPERS_USE_DEMO_DATA, !parsed.DATABASE_URL),
  }
}
