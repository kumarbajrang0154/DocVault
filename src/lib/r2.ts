import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
]);

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.m4a', '.wav', '.mp4', '.aac']);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'audio-track';
}

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 configuration error: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY must be set.'
    );
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadAudioFile(file: File, songTitle: string): Promise<string> {
  if (!file) {
    throw new Error('No audio file provided for upload.');
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrlBase = process.env.R2_PUBLIC_URL_BASE;

  if (!bucketName || !publicUrlBase) {
    throw new Error(
      'Cloudflare R2 configuration error: R2_BUCKET_NAME and R2_PUBLIC_URL_BASE environment variables must be set.'
    );
  }

  // Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMb}MB) exceeds the 20MB maximum limit for audio uploads.`);
  }

  // Validate MIME Type / Extension
  const originalName = file.name || 'audio.mp3';
  const extMatch = originalName.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '.mp3';

  const isMimeValid = ALLOWED_MIME_TYPES.has(file.type?.toLowerCase());
  const isExtValid = ALLOWED_EXTENSIONS.has(ext);

  if (!isMimeValid && !isExtValid) {
    throw new Error(
      `Unsupported audio file format (${file.type || ext}). Only MP3, M4A, WAV, and MP4 audio files are allowed.`
    );
  }

  // Generate Unique Storage Key
  const safeTitle = slugify(songTitle || 'song');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `audio/${safeTitle}-${timestamp}-${randomSuffix}${ext}`;

  // Read File Buffer & Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const r2Client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type || 'audio/mpeg',
  });

  try {
    await r2Client.send(command);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown S3/R2 upload error';
    throw new Error(`Cloudflare R2 storage upload failed: ${message}`);
  }

  const cleanBaseUrl = publicUrlBase.replace(/\/$/, '');
  return `${cleanBaseUrl}/${key}`;
}
