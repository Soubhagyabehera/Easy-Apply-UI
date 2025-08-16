/**
 * Format Converter Service for EasyApply Document Tools
 * Handles format conversion: PDF <-> images, document formats, etc.
 */

import { apiClient } from '../config/api';

export interface ConversionResponse {
  success: boolean;
  conversion_id?: string;
  conversion_type?: string;
  original_filename?: string;
  processed_filename?: string;
  input_format?: string;
  output_format?: string;
  total_pages?: number;
  output_files?: number;
  file_size_kb?: number;
  processing_time_ms?: number;
  download_url?: string;
  files?: Array<{
    file_id: string;
    filename: string;
    page?: number;
    size: number;
  }>;
  download_all_url?: string;
  error?: string;
}

class FormatConverterService {
  /**
   * Convert PDF to images
   */
  async pdfToImages(
    file: File,
    outputFormat: string = 'PNG',
    dpi: number = 200,
    quality: number = 95
  ): Promise<ConversionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('output_format', outputFormat);
      formData.append('dpi', dpi.toString());
      formData.append('quality', quality.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/pdf-to-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF to images conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert images to PDF
   */
  async imagesToPDF(
    files: File[],
    pageSize: string = 'A4',
    quality: number = 95
  ): Promise<ConversionResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('page_size', pageSize);
      formData.append('quality', quality.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/images-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Images to PDF conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert to image formats (JPG, PNG)
   */
  async convertToImage(
    file: File,
    outputFormat: string
  ): Promise<ConversionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', outputFormat);

      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/convert-to-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert document formats (DOCX, TXT, etc.)
   */
  async convertDocument(
    file: File,
    outputFormat: string
  ): Promise<ConversionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', outputFormat);

      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/document-format`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document conversion failed:', error);
      throw error;
    }
  }

  /**
   * Download converted file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/download/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  /**
   * Download batch of converted files as ZIP
   */
  async downloadBatch(conversionId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/download-batch/${conversionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Batch download failed:', error);
      throw error;
    }
  }

  /**
   * Validate file before conversion
   */
  async validateFile(file: File): Promise<{ success: boolean; valid: boolean; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/validate`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('File validation failed:', error);
      return { success: false, valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get format converter information and capabilities
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/format-converter/info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get format converter info:', error);
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

export const formatConverterService = new FormatConverterService();
