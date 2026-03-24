import { getPapersConfig } from "@papers/config"
import { NextResponse } from "next/server"

export function GET() {
  const config = getPapersConfig()

  return NextResponse.json({
    status: "ok",
    mode: config.PAPERS_USE_DEMO_DATA ? "demo" : "managed",
    timestamp: new Date().toISOString(),
  })
}
