import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getPapersConfig } from "@papers/config"

let cached: S3Client | null = null

export function getR2Client(): S3Client {
  if (cached) return cached

  const cfg = getPapersConfig()

  if (
    !cfg.PAPERS_R2_ACCOUNT_ID ||
    !cfg.PAPERS_R2_ACCESS_KEY_ID ||
    !cfg.PAPERS_R2_SECRET_ACCESS_KEY
  ) {
    throw new Error("R2 credentials are not configured — set PAPERS_R2_* env vars")
  }

  cached = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.PAPERS_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.PAPERS_R2_ACCESS_KEY_ID,
      secretAccessKey: cfg.PAPERS_R2_SECRET_ACCESS_KEY,
    },
  })

  return cached
}

export function getBucket(): string {
  const cfg = getPapersConfig()
  if (!cfg.PAPERS_R2_BUCKET) {
    throw new Error("PAPERS_R2_BUCKET is not configured")
  }
  return cfg.PAPERS_R2_BUCKET
}

export async function downloadObject(key: string): Promise<Uint8Array> {
  const client = getR2Client()
  const response = await client.send(new GetObjectCommand({ Bucket: getBucket(), Key: key }))
  if (!response.Body) {
    throw new Error(`Empty response body for key: ${key}`)
  }
  return response.Body.transformToByteArray()
}

export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}
