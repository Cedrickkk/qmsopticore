import { flaskApi } from '@/lib/api';
import { AxiosError } from 'axios';

interface Signature {
  file_name: string;
}

interface SignDocumentPayload {
  pdf: File;
  signatory: string;
  signatures: Signature[];
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
}

export const FlaskServiceApi = {
  async signDocument(payload: SignDocumentPayload) {
    try {
      const { data } = await flaskApi.post<SignDocumentResponse>('/api/sign', payload, { withCredentials: true });
      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
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
