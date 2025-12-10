/**
 * Media service API client for image uploads.
 */

import axios from 'axios';

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000';

export interface UploadResponse {
  file_key: string;
  presigned_url: string;
  public_url: string;
  metadata: {
    original_filename: string;
    content_type: string;
    file_size: number;
    width?: number;
    height?: number;
  };
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<UploadResponse>(
    `${MEDIA_URL}/api/media/upload-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export function getMediaUrl(fileKey: string): string {
  return `${MEDIA_URL}/api/media/file/${fileKey}`;
}

