import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/authGuard';
import { fetchDocumentFromCloudinary } from '@/lib/cloudinary';
import { decryptBuffer } from '@/lib/encryption';
import { logActivity } from '@/lib/activityLog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Strict multi-user ownership check: Document must exist and belong to session user
    const doc = await db.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    // 1. Fetch encrypted binary from Cloudinary authenticated private storage
    const encryptedBuffer = await fetchDocumentFromCloudinary(doc.fileKey);

    // 2. Decrypt binary server-side
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    // 3. Determine download vs inline preview
    const isDownload = req.nextUrl.searchParams.get('download') === 'true';
    const sanitizeTitle = doc.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const ext = doc.fileType.includes('pdf')
      ? '.pdf'
      : doc.fileType.includes('png')
      ? '.png'
      : doc.fileType.includes('webp')
      ? '.webp'
      : '.jpg';

    const filename = `${sanitizeTitle}${ext}`;

    await logActivity(
      isDownload ? 'DOCUMENT_DOWNLOADED' : 'DOCUMENT_VIEWED',
      'Document',
      doc.id,
      { title: doc.title }
    );

    const headers = new Headers();
    headers.set('Content-Type', doc.fileType || 'application/octet-stream');
    headers.set('Content-Length', decryptedBuffer.length.toString());
    headers.set(
      'Content-Disposition',
      isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
    );
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return new NextResponse(new Uint8Array(decryptedBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error streaming document';
    console.error('Document download/preview error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
