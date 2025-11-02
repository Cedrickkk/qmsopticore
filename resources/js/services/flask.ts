import { flaskApi } from '@/lib/api';
import { AxiosError } from 'axios';

interface Signature {
  file_name: string;
}

interface SignDocumentPayload {
  pdf: File;
  signatory: string;
  signatures: Signature[];
  representative_name?: string;
}

interface SignDocumentResponse {
  message?: string;
  error?: string;
}

interface VerifySignaturesResponse {
  isMatch: boolean;
  averageSimilarity: number;
  confidence: 'high' | 'low' | 'medium';
  error?: string;
  representative_name: string;
}

export const FlaskServiceApi = {
  async signDocument({ pdf, signatory, signatures, representative_name }: SignDocumentPayload): Promise<SignDocumentResponse> {
    try {
      const payload = {
        pdf,
        signatory,
        signatures,
        ...(representative_name && { representative_name }),
      };

      const { data } = await flaskApi.post<SignDocumentResponse>('/api/sign', payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error.response?.data?.error || 'Failed to sign document' };
      }
      return { error: 'An unexpected error occurred' };
    }
  },

  async validateSignatures(formData: FormData) {
    try {
      const { data } = await flaskApi.post<VerifySignaturesResponse>('/api/validate-signatures', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
};
