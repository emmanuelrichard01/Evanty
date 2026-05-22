import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2 } from '@/lib/integrations/r2';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return new NextResponse('Missing filename or contentType', { status: 400 });
    }

    // Basic MIME type validation
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    // Generate unique object key
    const fileExtension = filename.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const objectKey = `events/${uniqueId}.${fileExtension}`;

    const bucketName = process.env.R2_BUCKET_NAME || 'evanty-uploader-token';
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
    const publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${objectKey}`;

    return NextResponse.json({ url: signedUrl, publicUrl, objectKey });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
