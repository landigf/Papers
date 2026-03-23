"use server"

import { DEMO_AUTH_COOKIE } from "@papers/auth"
import { createRepository } from "@papers/db"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const repository = createRepository()

async function getViewerHandle() {
  const store = await cookies()
  return store.get(DEMO_AUTH_COOKIE)?.value ?? null
}

export async function demoSignInAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim()
  if (!identifier) {
    redirect("/sign-in")
  }

  const viewer =
    (await repository.getViewer(identifier)) ??
    (identifier.includes("@")
      ? await repository.getViewer(identifier.split("@")[0] ?? identifier)
      : null)

  if (!viewer) {
    redirect("/sign-up")
  }

  const store = await cookies()
  store.set(DEMO_AUTH_COOKIE, viewer.handle, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  redirect("/feed")
}

export async function demoSignUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const handle = String(formData.get("handle") ?? "").trim()

  if (!name || !email || !handle) {
    redirect("/sign-up")
  }

  const viewer = await repository.upsertDemoViewer({
    name,
    email,
    handle,
  })

  const store = await cookies()
  store.set(DEMO_AUTH_COOKIE, viewer.handle, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  redirect(`/u/${viewer.handle}`)
}

export async function signOutDemoAction() {
  const store = await cookies()
  store.delete(DEMO_AUTH_COOKIE)
  redirect("/")
}

export async function createPaperAction(formData: FormData) {
  const topicLabels = String(formData.get("topicLabels") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  const paper = await repository.createPaper(
    {
      title: String(formData.get("title") ?? ""),
      abstract: String(formData.get("abstract") ?? ""),
      bodyMarkdown: String(formData.get("bodyMarkdown") ?? ""),
      visibilityMode:
        String(formData.get("visibilityMode") ?? "public") === "blind" ? "blind" : "public",
      topicLabels,
    },
    await getViewerHandle(),
  )

  revalidatePath("/")
  revalidatePath("/feed")
  redirect(`/papers/${paper.slug}`)
}

export async function createCommentAction(formData: FormData) {
  const paperId = String(formData.get("paperId") ?? "")
  const body = String(formData.get("body") ?? "")
  await repository.createComment(
    {
      paperId,
      body,
    },
    await getViewerHandle(),
  )

  revalidatePath(`/papers/${paperId}`)
  redirect(`/papers/${paperId}`)
}

export async function toggleFollowAction(formData: FormData) {
  const handle = String(formData.get("handle") ?? "")
  await repository.toggleFollow(handle, await getViewerHandle())
  revalidatePath(`/u/${handle}`)
  revalidatePath("/feed")
  redirect(`/u/${handle}`)
}

export async function toggleStarAction(formData: FormData) {
  const paperSlug = String(formData.get("paperSlug") ?? "")
  await repository.toggleStar(paperSlug, await getViewerHandle())
  revalidatePath("/feed")
  revalidatePath(`/papers/${paperSlug}`)
  redirect(`/papers/${paperSlug}`)
}

export async function saveInterestAction(formData: FormData) {
  const label = String(formData.get("label") ?? "")
  await repository.saveInterest(label, await getViewerHandle())
  revalidatePath("/")
  revalidatePath("/feed")
  redirect("/feed")
}
