import { flaskApi } from '@/services/api';
import { AxiosError } from 'axios';

interface Signature {
  file_name: string;
}

interface SignDocumentPayload {
  document: File;
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
  error?: string;
}

export const FlaskServiceApi = {
  async signDocument(payload: SignDocumentPayload) {
    try {
      const { data } = await flaskApi.post<SignDocumentResponse>('/flask/api/sign', payload);
      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
  async verifySignatures(formData: FormData) {
    try {
      const { data } = await flaskApi.post<VerifySignaturesResponse>('/flask/api/verify-signatures', formData, {
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
