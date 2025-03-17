import { laravelApi } from '@/lib/api';
import { User } from '@/types';
import { Document } from '@/types/document';
import { AxiosError } from 'axios';

/**
 *  API Services
 *  Handles direct HTTP requests to Laravel backend APIs outside of Inertia.js
 */

interface UserSearchResponse {
  user?: User;
  error?: string;
}

interface DownloadResponse {
  error?: string;
  data?: Blob;
}

export const UserServiceApi = {
  async searchByEmail(email: string): Promise<UserSearchResponse> {
    try {
      const { data } = await laravelApi.get<UserSearchResponse>('/api/users/search', {
        params: { email },
      });

      return { user: data.user };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          return { error: error.response.data.message };
        }
      }
      return { error: 'Something went wrong. Please try again.' };
    }
  },
};

export const DocumentServiceApi = {
  async download(document: Document): Promise<DownloadResponse> {
    try {
      const { data } = await laravelApi.get(`/api/documents/${document.id}/download`, {
        responseType: 'blob',
      });
      return { data };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data instanceof Blob) {
          const errorData = await this.parseErrorBlob(error.response.data);
          return { error: errorData.error };
        }
        return { error: error.response?.data?.error || 'An unexpected error occurred' };
      }
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async parseErrorBlob(blob: Blob): Promise<{ error: string }> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(JSON.parse(reader.result as string));
      };
      reader.readAsText(blob);
    });
  },
};
