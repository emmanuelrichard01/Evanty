import { S3Client } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '', // The user provided an API token, but usually it needs accessKeyId and secretAccessKey
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_API_TOKEN || '', // Fallback to api token if secret not provided explicitly
  },
});
