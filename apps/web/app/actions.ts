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
  const affiliation = String(formData.get("affiliation") ?? "").trim()
  const interestLabels = String(formData.get("interestLabels") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  if (!name || !email || !handle) {
    redirect("/sign-up")
  }

  const viewer = await repository.upsertDemoViewer({
    name,
    email,
    handle,
    affiliation,
    interestLabels,
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
  revalidatePath("/digest")
  revalidatePath("/conferences")
  redirect(`/papers/${paper.slug}`)
}

export async function createCommentAction(formData: FormData) {
  const paperId = String(formData.get("paperId") ?? "")
  const body = String(formData.get("body") ?? "")
  const viewerHandle = await getViewerHandle()
  const comment = await repository.createComment({ paperId, body }, viewerHandle)

  const viewer = await repository.getViewer(viewerHandle)
  const paperSlug = String(formData.get("paperSlug") ?? paperId)
  const paperOwnerId = String(formData.get("paperOwnerId") ?? "")
  const paperTitle = String(formData.get("paperTitle") ?? "this paper")

  if (viewer && paperOwnerId && paperOwnerId !== viewer.id) {
    await repository.createNotification({
      recipientId: paperOwnerId,
      kind: "comment",
      title: "New comment on your paper",
      body: `${viewer.profile.displayName} commented on "${paperTitle}".`,
      linkHref: `/papers/${paperSlug}`,
      actorProfile: comment.authorProfile,
    })
  }

  revalidatePath(`/papers/${paperId}`)
  revalidatePath("/feed")
  revalidatePath("/digest")
  revalidatePath("/notifications")
  redirect(`/papers/${paperId}`)
}

export async function toggleFollowAction(formData: FormData) {
  const handle = String(formData.get("handle") ?? "")
  const viewerHandle = await getViewerHandle()
  const isNowFollowing = await repository.toggleFollow(handle, viewerHandle)

  if (isNowFollowing) {
    const viewer = await repository.getViewer(viewerHandle)
    const target = await repository.getProfileByHandle(handle)
    if (viewer && target) {
      const targetUser = await repository.getViewer(handle)
      if (targetUser && targetUser.id !== viewer.id) {
        await repository.createNotification({
          recipientId: targetUser.id,
          kind: "new_follower",
          title: "New follower",
          body: `${viewer.profile.displayName} started following you.`,
          linkHref: `/u/${viewer.handle}`,
          actorProfile: viewer.profile,
        })
      }
    }
  }

  revalidatePath(`/u/${handle}`)
  revalidatePath("/feed")
  revalidatePath("/")
  revalidatePath("/digest")
  revalidatePath("/notifications")
  redirect(`/u/${handle}`)
}

export async function toggleStarAction(formData: FormData) {
  const paperSlug = String(formData.get("paperSlug") ?? "")
  const viewerHandle = await getViewerHandle()
  const isNowStarred = await repository.toggleStar(paperSlug, viewerHandle)

  if (isNowStarred) {
    const viewer = await repository.getViewer(viewerHandle)
    const paperOwnerId = String(formData.get("paperOwnerId") ?? "")
    const paperTitle = String(formData.get("paperTitle") ?? "a paper")

    if (viewer && paperOwnerId && paperOwnerId !== viewer.id) {
      await repository.createNotification({
        recipientId: paperOwnerId,
        kind: "paper_starred",
        title: "Paper starred",
        body: `${viewer.profile.displayName} starred "${paperTitle}".`,
        linkHref: `/papers/${paperSlug}`,
        actorProfile: viewer.profile,
      })
    }
  }

  revalidatePath("/feed")
  revalidatePath("/")
  revalidatePath("/digest")
  revalidatePath(`/papers/${paperSlug}`)
  revalidatePath("/notifications")
  redirect(`/papers/${paperSlug}`)
}

export async function saveInterestAction(formData: FormData) {
  const label = String(formData.get("label") ?? "")
  const redirectTo = String(formData.get("redirectTo") ?? "/feed")
  await repository.saveInterest(label, await getViewerHandle())
  revalidatePath("/")
  revalidatePath("/feed")
  revalidatePath("/digest")
  revalidatePath("/opportunities")
  redirect(redirectTo)
}

export async function updateProfileAction(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") ?? "/settings/account")
  const interestLabels = String(formData.get("interestLabels") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  const viewer = await repository.updateViewerProfile(
    {
      headline: String(formData.get("headline") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      affiliation: String(formData.get("affiliation") ?? "").trim(),
      interestLabels,
    },
    await getViewerHandle(),
  )

  revalidatePath("/")
  revalidatePath("/feed")
  revalidatePath("/digest")
  revalidatePath("/opportunities")
  revalidatePath(`/u/${viewer.handle}`)
  revalidatePath("/settings/account")
  redirect(redirectTo)
}

export async function submitPaperToConferenceAction(formData: FormData) {
  const conferenceSlug = String(formData.get("conferenceSlug") ?? "")
  const paperSlug = String(formData.get("paperSlug") ?? "")
  await repository.submitPaperToConference(
    {
      conferenceSlug,
      paperSlug,
    },
    await getViewerHandle(),
  )

  revalidatePath("/conferences")
  revalidatePath(`/conferences/${conferenceSlug}`)
  revalidatePath(`/papers/${paperSlug}`)
  revalidatePath("/digest")
  redirect(`/conferences/${conferenceSlug}`)
}

export async function createPeerReviewAction(formData: FormData) {
  const conferenceSlug = String(formData.get("conferenceSlug") ?? "")
  const viewerHandle = await getViewerHandle()
  await repository.createPeerReview(
    {
      conferenceSlug,
      submissionId: String(formData.get("submissionId") ?? ""),
      score: Number(formData.get("score") ?? 0),
      confidence: Number(formData.get("confidence") ?? 0),
      summary: String(formData.get("summary") ?? "").trim(),
      strengths: String(formData.get("strengths") ?? "").trim(),
      concerns: String(formData.get("concerns") ?? "").trim(),
      recommendation: String(formData.get("recommendation") ?? "borderline") as
        | "accept"
        | "weak_accept"
        | "borderline"
        | "weak_reject"
        | "reject",
    },
    viewerHandle,
  )

  const paperOwnerId = String(formData.get("paperOwnerId") ?? "")
  const viewer = await repository.getViewer(viewerHandle)
  if (viewer && paperOwnerId && paperOwnerId !== viewer.id) {
    await repository.createNotification({
      recipientId: paperOwnerId,
      kind: "peer_review_received",
      title: "New peer review",
      body: `${viewer.profile.displayName} reviewed your submission in "${String(formData.get("conferenceName") ?? "a conference")}".`,
      linkHref: `/conferences/${conferenceSlug}`,
      actorProfile: viewer.profile,
    })
  }

  revalidatePath(`/conferences/${conferenceSlug}`)
  revalidatePath("/digest")
  revalidatePath("/notifications")
  redirect(`/conferences/${conferenceSlug}`)
}

export async function markNotificationsReadAction() {
  await repository.markNotificationsRead(await getViewerHandle())
  revalidatePath("/notifications")
  revalidatePath("/")
}
