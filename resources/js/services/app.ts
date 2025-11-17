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

interface BackupResponse {
  error?: string;
  success?: boolean;
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

  async searchRepresentativeByEmail(email: string): Promise<UserSearchResponse> {
    try {
      const { data } = await laravelApi.get<UserSearchResponse>('/api/users/search-representative', {
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
  async download(document: Document, password?: string | null): Promise<DownloadResponse> {
    try {
      const { data } = await laravelApi.post(
        `/api/documents/${document.id}/download`,
        { password },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, application/octet-stream',
          },
        }
      );
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

  async bulkDownload(documentIds: number[], password?: string | null): Promise<DownloadResponse> {
    try {
      const { data } = await laravelApi.post('/api/documents/bulk-download', { document_ids: documentIds, password }, { responseType: 'blob' });
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

export const BackupServiceApi = {
  async createDatabaseBackup(): Promise<BackupResponse> {
    try {
      await laravelApi.post('/api/backups');
      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error.response?.data?.message || 'Failed to create database backup' };
      }
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async createDocumentBackup(): Promise<BackupResponse> {
    try {
      await laravelApi.post('/api/backups/documents');
      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error.response?.data?.message || 'Failed to create document backup' };
      }
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async download(backupId: number): Promise<DownloadResponse> {
    try {
      const { data } = await laravelApi.get(`/api/backups/${backupId}/download`, {
        responseType: 'blob',
      });
      return { data };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data instanceof Blob) {
          const errorData = await this.parseErrorBlob(error.response.data);
          return { error: errorData.error };
        }
        return { error: error.response?.data?.error || 'Failed to download backup' };
      }
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async delete(backupId: number): Promise<BackupResponse> {
    try {
      await laravelApi.delete(`/api/backups/${backupId}`);
      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error.response?.data?.message || 'Failed to delete backup' };
      }
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async cleanOldBackups(): Promise<BackupResponse> {
    try {
      await laravelApi.post('/api/backups/clean');
      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error.response?.data?.message || 'Failed to clean old backups' };
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
