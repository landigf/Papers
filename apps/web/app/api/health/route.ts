import { getPapersConfig } from "@papers/config"
import { pingDatabase } from "@papers/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = getPapersConfig()
  const demoMode = config.PAPERS_USE_DEMO_DATA

  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {}

  if (config.DATABASE_URL) {
    const db = await pingDatabase(config.DATABASE_URL)
    checks.database = db.ok
      ? { status: "ok", latencyMs: db.latencyMs }
      : { status: "fail", latencyMs: db.latencyMs, error: db.error }
  } else {
    checks.database = { status: "skip", error: "DATABASE_URL not configured" }
  }

  const allOk = Object.values(checks).every((c) => c.status !== "fail")

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      demoMode,
      checks,
    },
    { status: allOk ? 200 : 503 },
  )
}
