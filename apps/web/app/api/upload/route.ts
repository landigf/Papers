import { randomUUID } from "node:crypto"
import { DEMO_AUTH_COOKIE } from "@papers/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { storeFile } from "../../../lib/storage"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_MIME_TYPES = ["application/pdf"]

export async function POST(request: Request) {
  const store = await cookies()
  const viewer = store.get(DEMO_AUTH_COOKIE)?.value
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 20 MB limit" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const storageKey = `${randomUUID()}.pdf`

  await storeFile(storageKey, buffer, file.type)

  let extractedTitle: string | null = null
  let extractedAuthor: string | null = null
  try {
    const { PDFDocument } = await import("pdf-lib")
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    extractedTitle = pdfDoc.getTitle() ?? null
    extractedAuthor = pdfDoc.getAuthor() ?? null
  } catch {
    // PDF metadata extraction is best-effort
  }

  return NextResponse.json({
    storageKey,
    fileName: file.name,
    mimeType: file.type,
    fileSizeBytes: file.size,
    extractedTitle,
    extractedAuthor,
  })
}
