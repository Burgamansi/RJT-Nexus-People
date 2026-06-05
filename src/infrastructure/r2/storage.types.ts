/**
 * RJT NEXUS PEOPLE - Cloudflare R2 Edge Object Storage Types
 * Preserves strict S3-compatible interfaces.
 */

export interface StorageObjectMetadata {
  key: string;               // e.g. "imports/tenant_ubg/batch_123.csv"
  bucketName: string;
  sizeBytes: number;
  contentType: string;
  eTag: string;
  lastModified: string;      // ISO String
  customMetadata?: Record<string, string>;
}

export interface FileUploadRequest {
  key: string;
  content: ArrayBuffer | string | Blob;
  contentType: string;
  tenantId: string;
  customMetadata?: Record<string, string>;
}

export interface FileUploadResult {
  key: string;
  url: string;               // Edge CDN or R2 public/private signed endpoint
  sizeBytes: number;
  eTag: string;
}

export interface PresignedUrlRequest {
  key: string;
  tenantId: string;
  operation: "getObject" | "putObject";
  expiresInSeconds?: number; // Defaults to 3600
}
