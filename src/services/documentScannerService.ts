/**
 * Document Scanner Service for EasyApply Document Tools
 * Handles document scanning: image-to-PDF, enhancement, auto-cropping
 */

import { apiClient } from '../config/api';

export interface ScanResponse {
  success: boolean;
  scan_id?: string;
  original_filename?: string;
  processed_filename?: string;
  scan_type?: string;
  enhancement_applied?: boolean;
  auto_crop_applied?: boolean;
  total_pages?: number;
  file_size_kb?: number;
  processing_time_ms?: number;
  download_url?: string;
  thumbnail_url?: string;
  opencv_available?: boolean;
  enhancement_method?: string;
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
   * Scan images to PDF
   */
  async scanToPDF(
    files: File[],
    enhanceImages: boolean = true,
    autoCrop: boolean = true
  ): Promise<ScanResponse | BatchScanResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('enhance_images', enhanceImages.toString());
      formData.append('auto_crop', autoCrop.toString());

      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/scan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document scan failed:', error);
      throw error;
    }
  }

  /**
   * Enhance existing scanned images
   */
  async enhanceScan(
    files: File[],
    enhancementLevel: string = 'medium'
  ): Promise<ScanResponse | BatchScanResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('enhancement_level', enhancementLevel);

      const response = await fetch(`${apiClient.defaults.baseURL}/document-scanner/enhance`, {
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
