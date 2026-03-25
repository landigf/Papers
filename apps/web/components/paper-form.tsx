"use client"

import { ActionButton, SectionCard } from "@papers/ui"
import { useRef, useState } from "react"
import { createPaperAction } from "../app/actions"

export function PaperForm() {
  const [uploadState, setUploadState] = useState<{
    storageKey: string
    fileName: string
    mimeType: string
    fileSizeBytes: number
    extractedTitle: string | null
    extractedAuthor: string | null
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setUploadState(null)

    const body = new FormData()
    body.append("file", file)

    try {
      const response = await fetch("/papers/api/upload", { method: "POST", body })
      if (!response.ok) {
        const data = await response.json()
        setUploadError(data.error ?? "Upload failed")
        return
      }
      const data = await response.json()
      setUploadState(data)

      if (data.extractedTitle && titleRef.current && !titleRef.current.value) {
        titleRef.current.value = data.extractedTitle
      }
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <SectionCard eyebrow="Publish" title="Share a paper or research note">
      <form action={createPaperAction} className="stacked-form" ref={formRef}>
        <label>
          PDF file (optional)
          <input
            accept="application/pdf"
            disabled={uploading}
            name="pdfFile"
            onChange={handleFileChange}
            type="file"
          />
        </label>
        {uploading && <p className="field-note">Uploading PDF…</p>}
        {uploadError && (
          <p className="field-note" style={{ color: "var(--color-danger, #c00)" }}>
            {uploadError}
          </p>
        )}
        {uploadState && (
          <p className="field-note">
            Uploaded: {uploadState.fileName} ({Math.round(uploadState.fileSizeBytes / 1024)} KB)
            {uploadState.extractedTitle && ` — extracted title: "${uploadState.extractedTitle}"`}
            {uploadState.extractedAuthor && ` — author: ${uploadState.extractedAuthor}`}
          </p>
        )}
        {uploadState && (
          <>
            <input name="assetStorageKey" type="hidden" value={uploadState.storageKey} />
            <input name="assetFileName" type="hidden" value={uploadState.fileName} />
            <input name="assetMimeType" type="hidden" value={uploadState.mimeType} />
            <input name="assetFileSizeBytes" type="hidden" value={uploadState.fileSizeBytes} />
          </>
        )}
        <label>
          Title
          <input
            name="title"
            placeholder="A clear title for the paper or open research note"
            ref={titleRef}
            required
          />
        </label>
        <label>
          Abstract
          <textarea
            name="abstract"
            placeholder="A public summary that makes the contribution, tension, or open problem clear."
            required
            rows={5}
          />
        </label>
        <label>
          Body
          <textarea
            name="bodyMarkdown"
            placeholder="Use markdown. Explain the idea, the setup, the result, or the open question."
            required
            rows={12}
          />
        </label>
        <label>
          Topic labels
          <input
            name="topicLabels"
            placeholder="agents, distributed systems, reproducibility"
            required
          />
        </label>
        <label>
          Visibility
          <select defaultValue="public" name="visibilityMode">
            <option value="public">Standard post</option>
            <option value="blind">Blind post</option>
          </select>
        </label>
        <p className="field-note">
          Blind posts hide public identity on feed cards, paper pages, and comments.
          {uploadState && " PDF metadata will be scrubbed for blind submissions."}
        </p>
        <ActionButton type="submit">Publish to Papers</ActionButton>
      </form>
    </SectionCard>
  )
}
