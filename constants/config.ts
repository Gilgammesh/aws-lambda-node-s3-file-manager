import * as dotenv from 'dotenv';

// Habilitamos las variables de entorno
dotenv.config();

// S3 Bucket
export const s3Bucket = process.env.S3_BUCKET as string;
