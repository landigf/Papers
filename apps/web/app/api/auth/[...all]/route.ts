import { createAuthRouteHandlers } from "@papers/auth"
import { NextResponse } from "next/server"

const handlers = createAuthRouteHandlers()

async function unavailable() {
  return NextResponse.json(
    {
      message: "Managed Better Auth is not configured yet. Demo auth is active instead.",
    },
    { status: 503 },
  )
}

export const GET = handlers?.GET ?? unavailable
export const POST = handlers?.POST ?? unavailable
export const PATCH = handlers?.PATCH ?? unavailable
export const PUT = handlers?.PUT ?? unavailable
export const DELETE = handlers?.DELETE ?? unavailable
