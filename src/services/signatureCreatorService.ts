/**
 * Signature Creator Service for EasyApply Document Tools
 * Handles signature creation: text, drawn, and uploaded signatures
 */

import { apiClient } from '../config/api';

export interface SignatureResponse {
  success: boolean;
  signature_id?: string;
  signature_type?: string;
  signature_text?: string;
  original_filename?: string;
  font_style?: string;
  font_size?: number;
  signature_size?: string;
  color?: string;
  background_transparent?: boolean;
  width?: number;
  height?: number;
  file_size_kb?: number;
  processing_time_ms?: number;
  download_url?: string;
  thumbnail_url?: string;
  error?: string;
}

class SignatureCreatorService {
  /**
   * Create a text-based signature
   */
  async createTextSignature(
    text: string,
    fontStyle: string = 'arial',
    fontSize: number = 24,
    signatureSize: string = 'medium',
    color: string = '#000000',
    backgroundTransparent: boolean = true
  ): Promise<SignatureResponse> {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('font_style', fontStyle);
      formData.append('font_size', fontSize.toString());
      formData.append('signature_size', signatureSize);
      formData.append('color', color);
      formData.append('background_transparent', backgroundTransparent.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/create-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Text signature creation failed:', error);
      throw error;
    }
  }

  /**
   * Create a drawn signature from canvas data
   */
  async createDrawnSignature(
    signatureData: string,
    signatureSize: string = 'medium',
    backgroundTransparent: boolean = true
  ): Promise<SignatureResponse> {
    try {
      const formData = new FormData();
      formData.append('signature_data', signatureData);
      formData.append('signature_size', signatureSize);
      formData.append('background_transparent', backgroundTransparent.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/create-drawn`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Drawn signature creation failed:', error);
      throw error;
    }
  }

  /**
   * Upload and process a signature image
   */
  async uploadSignature(
    file: File,
    signatureSize: string = 'medium',
    backgroundTransparent: boolean = true
  ): Promise<SignatureResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature_size', signatureSize);
      formData.append('background_transparent', backgroundTransparent.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Signature upload failed:', error);
      throw error;
    }
  }

  /**
   * Download signature file
   */
  async downloadSignature(signatureId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/download/${signatureId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Signature download failed:', error);
      throw error;
    }
  }

  /**
   * Get signature thumbnail
   */
  async getThumbnail(signatureId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/thumbnail/${signatureId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Signature thumbnail failed:', error);
      throw error;
    }
  }

  /**
   * Get signature creator information and capabilities
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/signature-creator/info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get signature creator info:', error);
      throw error;
    }
  }

  /**
   * Trigger file download in browser
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const signatureCreatorService = new SignatureCreatorService();
