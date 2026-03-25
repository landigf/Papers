import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getPapersConfig } from "@papers/config"

export type StoredFile = {
  storageKey: string
  fileName: string
  mimeType: string
  fileSizeBytes: number
}

function getDemoUploadsDir(): string {
  const config = getPapersConfig()
  return path.join(config.PGLITE_DATA_DIR, "uploads")
}

function isR2Configured(): boolean {
  const config = getPapersConfig()
  return !!(
    config.PAPERS_R2_ACCOUNT_ID &&
    config.PAPERS_R2_ACCESS_KEY_ID &&
    config.PAPERS_R2_SECRET_ACCESS_KEY &&
    config.PAPERS_R2_BUCKET
  )
}

async function putR2(key: string, body: Buffer, contentType: string): Promise<void> {
  const config = getPapersConfig()
  const accountId = config.PAPERS_R2_ACCOUNT_ID ?? ""
  const accessKeyId = config.PAPERS_R2_ACCESS_KEY_ID ?? ""
  const secretAccessKey = config.PAPERS_R2_SECRET_ACCESS_KEY ?? ""
  const bucket = config.PAPERS_R2_BUCKET ?? ""
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

async function putDemo(key: string, body: Buffer): Promise<void> {
  const dir = getDemoUploadsDir()
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, key), body)
}

export async function storeFile(key: string, body: Buffer, contentType: string): Promise<void> {
  if (isR2Configured()) {
    await putR2(key, body, contentType)
  } else {
    await putDemo(key, body)
  }
}

export async function readStoredFile(key: string): Promise<Buffer | null> {
  if (isR2Configured()) {
    const config = getPapersConfig()
    const accessKeyId = config.PAPERS_R2_ACCESS_KEY_ID ?? ""
    const secretAccessKey = config.PAPERS_R2_SECRET_ACCESS_KEY ?? ""
    const bucket = config.PAPERS_R2_BUCKET ?? ""
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3")
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.PAPERS_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    )
    if (!result.Body) return null
    return Buffer.from(await result.Body.transformToByteArray())
  }

  const filePath = path.join(getDemoUploadsDir(), key)
  try {
    return await readFile(filePath)
  } catch {
    return null
  }
}

export function getPublicFileUrl(key: string): string {
  const config = getPapersConfig()
  if (config.PAPERS_R2_PUBLIC_BASE_URL) {
    return `${config.PAPERS_R2_PUBLIC_BASE_URL}/${key}`
  }
  return `${config.BETTER_AUTH_URL}/papers/api/files/${encodeURIComponent(key)}`
}
