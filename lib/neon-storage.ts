import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION || 'us-east-2';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const isStorageConfigured = Boolean(endpoint && accessKeyId && secretAccessKey);

export const s3Client = isStorageConfigured
  ? new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
      forcePathStyle: true,
    })
  : null;

export const NEON_ASSETS_BUCKET = 'assets';

/**
 * Upload an asset buffer to Neon Object Storage
 */
export async function uploadToNeonStorage(key: string, body: Buffer | Uint8Array | string, contentType?: string) {
  if (!s3Client) {
    throw new Error('Neon Object Storage is not configured (missing env vars)');
  }

  const command = new PutObjectCommand({
    Bucket: NEON_ASSETS_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream',
  });

  return await s3Client.send(command);
}

/**
 * List files in Neon Object Storage bucket
 */
export async function listNeonStorageFiles() {
  if (!s3Client) {
    return [];
  }

  const command = new ListObjectsV2Command({
    Bucket: NEON_ASSETS_BUCKET,
  });

  const res = await s3Client.send(command);
  return res.Contents?.map((item) => ({ key: item.Key, size: item.Size, lastModified: item.LastModified })) || [];
}
