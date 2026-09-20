import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
]);

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary configuration error: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables must be set.'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || 'document'
  );
}

export async function uploadDocumentToCloudinary(
  encryptedBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userId: string
): Promise<{ fileKey: string; size: number }> {
  configureCloudinary();

  if (!encryptedBuffer || encryptedBuffer.length === 0) {
    throw new Error('No document content provided for upload.');
  }

  if (encryptedBuffer.length > MAX_FILE_SIZE_BYTES + 1024) {
    const sizeMb = (encryptedBuffer.length / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMb}MB) exceeds the 15MB maximum limit.`);
  }

  const normalizedMime = mimeType?.toLowerCase() || '';
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new Error(
      `Unsupported file format (${mimeType}). Only PDF documents and standard images (JPEG, PNG, WEBP) are allowed.`
    );
  }

  const extMatch = originalFileName.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '.pdf';
  const safeTitle = slugify(originalFileName.replace(/\.[0-9a-z]+$/i, ''));
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const publicId = `docvault/${userId}/${safeTitle}-${timestamp}-${randomSuffix}${ext}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'raw',
        type: 'authenticated', // Private authenticated asset
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          const msg = error?.message || 'Cloudinary upload failed';
          return reject(new Error(`Cloudinary document storage upload failed: ${msg}`));
        }
        resolve({
          fileKey: result.public_id,
          size: encryptedBuffer.length,
        });
      }
    );

    uploadStream.end(encryptedBuffer);
  });
}

export async function fetchDocumentFromCloudinary(fileKey: string): Promise<Buffer> {
  configureCloudinary();

  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5 minute signed URL
    const signedUrl = cloudinary.utils.private_download_url(fileKey, '', {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: expiresAt,
    });

    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Cloudinary returned HTTP status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Cloudinary retrieval error';
    throw new Error(`Cloudinary document retrieval failed: ${message}`);
  }
}

export async function deleteDocumentFromCloudinary(fileKey: string): Promise<void> {
  configureCloudinary();

  try {
    await cloudinary.uploader.destroy(fileKey, {
      resource_type: 'raw',
      type: 'authenticated',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Cloudinary deletion error';
    console.error(`Failed to delete object from Cloudinary (${fileKey}):`, message);
  }
}
