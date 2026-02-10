import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

function getS3Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Compress image to WebP and upload to R2.
 * Returns the R2 storage key (not a URL).
 */
export async function uploadImage(
  buffer: Buffer,
  key: string
): Promise<string> {
  const compressed = await sharp(buffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: compressed,
      ContentType: "image/webp",
    })
  );

  return key;
}

/**
 * Upload a raw buffer to R2 without compression.
 * Returns the R2 storage key (not a URL).
 */
export async function uploadRaw(
  buffer: Buffer,
  key: string,
  contentType: string = "image/webp"
): Promise<string> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return key;
}

/**
 * Generate a signed download URL for an R2 object.
 */
export async function getImageSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
    { expiresIn }
  );
}

/**
 * Download an image from R2 as a Buffer.
 */
export async function downloadImage(key: string): Promise<Buffer> {
  const client = getS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );

  const body = response.Body;
  if (!body) throw new Error(`No body returned for key: ${key}`);

  const chunks: Uint8Array[] = [];
  // @ts-expect-error — S3 body is a readable stream
  for await (const chunk of body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Delete an image from R2.
 */
export async function deleteImage(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

/**
 * Generate a storage key for a generated image.
 */
export function generationKey(mixId: string, generationId: string): string {
  return `mixes/${mixId}/gen-${generationId}.webp`;
}

/**
 * Generate a storage key for a synthesized image.
 */
export function synthesisKey(mixId: string): string {
  return `mixes/${mixId}/synthesis.webp`;
}
