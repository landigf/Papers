import { NextResponse } from "next/server"
import { readStoredFile } from "../../../../lib/storage"

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params

  if (!key || key.includes("..") || key.includes("/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 })
  }

  const buffer = await readStoredFile(key)
  if (!buffer) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
