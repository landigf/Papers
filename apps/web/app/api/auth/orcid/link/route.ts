import { auth } from "@papers/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!auth) {
    return NextResponse.json({ message: "Managed auth is not configured." }, { status: 503 })
  }

  const origin = new URL(request.url).origin

  // Call Better Auth's social sign-in endpoint to get the ORCID authorization URL.
  const internalUrl = new URL("/api/auth/sign-in/social", origin)
  const response = await auth.handler(
    new Request(internalUrl, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      }),
      body: JSON.stringify({
        provider: "orcid",
        callbackURL: "/settings/identity",
      }),
    }),
  )

  if (response.ok) {
    const data = (await response.json()) as { url?: string }
    if (data.url) {
      return NextResponse.redirect(data.url)
    }
  }

  return NextResponse.redirect(new URL("/settings/identity?error=orcid-link-failed", origin))
}
