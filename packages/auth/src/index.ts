import { getPapersConfig } from "@papers/config"
import { authAccounts, authSessions, authUsers, authVerifications, profiles } from "@papers/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies, toNextJsHandler } from "better-auth/next-js"
import { genericOAuth } from "better-auth/plugins"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

export const DEMO_AUTH_COOKIE = "papers_demo_viewer"

export function getAuthMode(): "demo" | "managed" {
  const config = getPapersConfig()
  return config.DATABASE_URL && config.BETTER_AUTH_SECRET ? "managed" : "demo"
}

function getManagedAuth() {
  const config = getPapersConfig()
  if (!config.DATABASE_URL || !config.BETTER_AUTH_SECRET) {
    return null
  }

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
  })
  const db = drizzle(pool)

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authUsers,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
      },
    }),
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    trustedOrigins: config.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    databaseHooks: {
      account: {
        create: {
          after: async (account) => {
            if (account.providerId === "orcid" && account.accountId) {
              await db
                .update(profiles)
                .set({ orcid: account.accountId })
                .where(eq(profiles.userId, account.userId))
            }
          },
        },
      },
    },
    plugins: [
      nextCookies(),
      ...(config.PAPERS_ORCID_CLIENT_ID && config.PAPERS_ORCID_CLIENT_SECRET
        ? [
            genericOAuth({
              config: [
                {
                  providerId: "orcid",
                  discoveryUrl: config.PAPERS_ORCID_DISCOVERY_URL,
                  clientId: config.PAPERS_ORCID_CLIENT_ID,
                  clientSecret: config.PAPERS_ORCID_CLIENT_SECRET,
                  scopes: config.PAPERS_ORCID_SCOPES.split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                  disableImplicitSignUp: true,
                  mapProfileToUser(profile) {
                    const profileRecord = profile as Record<string, unknown>
                    const subject = String(profileRecord.sub ?? "orcid-user")
                    const name = String(profileRecord.name ?? `ORCID ${subject}`)
                    return {
                      name,
                      email: `${subject}@orcid.local`,
                    }
                  },
                },
              ],
            }),
          ]
        : []),
    ],
  })
}

export const auth = getManagedAuth()

export function createAuthRouteHandlers() {
  if (!auth) {
    return null
  }

  return toNextJsHandler(auth)
}

export function getOrcidStatus() {
  const config = getPapersConfig()
  return {
    configured: Boolean(config.PAPERS_ORCID_CLIENT_ID && config.PAPERS_ORCID_CLIENT_SECRET),
    discoveryUrl: config.PAPERS_ORCID_DISCOVERY_URL,
  }
}
