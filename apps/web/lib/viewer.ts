import { DEMO_AUTH_COOKIE, getAuthMode, getOrcidStatus } from "@papers/auth"
import { createRepository } from "@papers/db"
import { cookies } from "next/headers"

const repository = createRepository()

export async function getViewerHandleFromCookies(): Promise<string | null> {
  const store = await cookies()
  return store.get(DEMO_AUTH_COOKIE)?.value ?? null
}

export async function getViewer() {
  return repository.getViewer(await getViewerHandleFromCookies())
}

export async function getSessionContext() {
  const viewer = await getViewer()
  return {
    viewer,
    authMode: getAuthMode(),
    orcid: getOrcidStatus(),
  }
}
