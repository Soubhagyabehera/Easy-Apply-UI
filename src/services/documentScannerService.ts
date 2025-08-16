/**
 * Document Scanner Service for EasyApply Document Tools
 * Handles document scanning: image-to-PDF, enhancement, auto-cropping
 */

import { apiClient } from '../config/api';

export interface ScanResponse {
  success: boolean;
  scan_id?: string;
  output_filename?: string;
  output_format?: string;
  input_files?: number;
  enhancement_level?: string;
  auto_crop?: boolean;
  page_size?: string;
  input_size_mb?: number;
  output_size_mb?: number;
  processing_time_ms?: number;
  download_url?: string;
  error?: string;
}

export interface BatchScanResponse {
  success: boolean;
  batch_id: string;
  total_files: number;
  total_pages: number;
  scanned_files: Array<{
    scan_id: string;
    filename: string;
    pages: number;
    size: number;
  }>;
  processing_time_ms: number;
  download_all_url?: string;
}

class DocumentScannerService {
  /**
   * Scan images to PDF with enhancement options
   */
  async scanToPDF(
    files: File[],
    options: {
      outputFormat?: string;
      enhancementLevel?: string;
      autoCrop?: boolean;
      pageSize?: string;
    } = {}
  ): Promise<ScanResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('output_format', options.outputFormat || 'PDF');
      formData.append('enhancement_level', options.enhancementLevel || 'medium');
      formData.append('auto_crop', (options.autoCrop !== false).toString());
      formData.append('page_size', options.pageSize || 'A4');

      console.log('Sending request to:', `${apiClient.defaults.baseURL}/document-scanner/scan-to-pdf`);
      console.log('FormData contents:', Array.from(formData.entries()));

      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/scan-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('Document scan failed:', error);
      throw error;
    }
  }

  /**
   * Enhance existing scanned images
   */
  async enhanceScan(
    file: File,
    enhancementLevel: string = 'medium',
    outputFormat: string = 'PNG'
  ): Promise<ScanResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('enhancement_level', enhancementLevel);
      formData.append('output_format', outputFormat);

      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/enhance-scan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scan enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Download scanned file
   */
  async downloadScan(scanId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/download/${scanId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Scan download failed:', error);
      throw error;
    }
  }

  /**
   * Download batch of scanned files as ZIP
   */
  async downloadBatch(batchId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/download-batch/${batchId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Scan batch download failed:', error);
      throw error;
    }
  }

  /**
   * Validate image file before scanning
   */
  async validateImage(file: File): Promise<{ success: boolean; valid: boolean; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/validate`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Image validation failed:', error);
      return { success: false, valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get document scanner information and capabilities
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get document scanner info:', error);
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

export const documentScannerService = new DocumentScannerService();
