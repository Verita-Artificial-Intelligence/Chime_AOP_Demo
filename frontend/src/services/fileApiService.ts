import axios, { AxiosResponse } from 'axios';
import { getApiUrl } from '../config/api';

// File management interfaces
export interface UploadFileResponse {
  success: boolean;
  message: string;
  bucket: string;
  key: string;
  url?: string;
}

export interface DownloadFileResponse {
  success: boolean;
  url: string;
  contentType?: string;
}

export interface DeleteFileRequest {
  bucket: string;
  key: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

export interface CreateBucketRequest {
  bucket_name: string;
  region?: string;
}

export interface CreateBucketResponse {
  success: boolean;
  message: string;
  bucket_name: string;
}

export interface BucketExistsResponse {
  exists: boolean;
  bucket_name: string;
}

export interface ObjectExistsResponse {
  exists: boolean;
  bucket: string;
  key: string;
}

export interface ListBucketsResponse {
  buckets: Array<{
    name: string;
    creationDate: string;
  }>;
}

/**
 * Service for file and bucket management operations
 */
export class FileApiService {
  /**
   * Upload a file to a bucket
   */
  static async uploadFile(
    file: File,
    bucket: string,
    key?: string,
    overwrite: boolean = false
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<UploadFileResponse> = await axios.post(
      getApiUrl('uploadFile'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          bucket,
          ...(key && { key }),
          overwrite,
        },
      }
    );

    return response.data;
  }

  /**
   * Download a file from a bucket
   */
  static async downloadFile(bucket: string, key: string): Promise<DownloadFileResponse> {
    const response: AxiosResponse<DownloadFileResponse> = await axios.get(
      getApiUrl('downloadFile'),
      {
        params: {
          bucket,
          key,
        },
      }
    );

    return response.data;
  }

  /**
   * Delete a file from a bucket
   */
  static async deleteFile(bucket: string, key: string): Promise<DeleteFileResponse> {
    const request: DeleteFileRequest = { bucket, key };
    
    const response: AxiosResponse<DeleteFileResponse> = await axios.post(
      getApiUrl('deleteFile'),
      request
    );

    return response.data;
  }

  /**
   * Check if a bucket exists
   */
  static async bucketExists(bucketName: string): Promise<BucketExistsResponse> {
    const response: AxiosResponse<BucketExistsResponse> = await axios.get(
      getApiUrl('bucketExists'),
      {
        params: {
          bucket_name: bucketName,
        },
      }
    );

    return response.data;
  }

  /**
   * Check if an object exists in a bucket
   */
  static async objectExists(bucket: string, key: string): Promise<ObjectExistsResponse> {
    const response: AxiosResponse<ObjectExistsResponse> = await axios.get(
      getApiUrl('objectExists'),
      {
        params: {
          bucket,
          key,
        },
      }
    );

    return response.data;
  }

  /**
   * Create a new bucket
   */
  static async createBucket(
    bucketName: string,
    region?: string
  ): Promise<CreateBucketResponse> {
    const request: CreateBucketRequest = {
      bucket_name: bucketName,
      ...(region && { region }),
    };
    
    const response: AxiosResponse<CreateBucketResponse> = await axios.post(
      getApiUrl('createBucket'),
      request
    );

    return response.data;
  }

  /**
   * List all buckets
   */
  static async listBuckets(): Promise<ListBucketsResponse> {
    const response: AxiosResponse<ListBucketsResponse> = await axios.get(
      getApiUrl('listBuckets')
    );

    return response.data;
  }

  /**
   * Helper method for safe API calls with error handling
   */
  static async safeApiCall<T>(
    apiCall: () => Promise<T>,
    errorContext: string
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const data = await apiCall();
      return { success: true, data };
    } catch (error) {
      console.error(`${errorContext}:`, error);
      
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default FileApiService;
