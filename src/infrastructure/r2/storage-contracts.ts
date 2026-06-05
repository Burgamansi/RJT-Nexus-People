import {
  StorageObjectMetadata,
  FileUploadRequest,
  FileUploadResult,
  PresignedUrlRequest
} from "./storage.types";

/**
 * High-performance, tenant-isolated Object Storage Client Interface.
 * Implements S3-compatible CRUD operations mapping directly to Cloudflare R2 bindings.
 */
export interface IObjectStorageProvider {
  /**
   * Uploads an object/file into the tenant storage partition.
   */
  uploadFile(request: FileUploadRequest): Promise<FileUploadResult>;

  /**
   * Downloads raw object content as ArrayBuffer under strict tenant scope matching.
   */
  downloadFile(key: string, tenantId: string): Promise<ArrayBuffer>;

  /**
   * Deletes a file key from the storage bucket.
   */
  deleteFile(key: string, tenantId: string): Promise<boolean>;

  /**
   * Checks the existence and gathers metadata info for an object key.
   */
  getMetadata(key: string, tenantId: string): Promise<StorageObjectMetadata | null>;

  /**
   * Generates secure, short-lived presigned URLs for client-side uploads (putObject)
   * or downloads (getObject) directly from Cloudflare R2.
   */
  generatePresignedUrl(request: PresignedUrlRequest): Promise<string>;

  /**
   * Lists object metadata keys within a tenant folder path prefix.
   */
  listFiles(prefix: string, tenantId: string): Promise<StorageObjectMetadata[]>;
}
