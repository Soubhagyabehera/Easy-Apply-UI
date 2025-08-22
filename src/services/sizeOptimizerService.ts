/**
 * Size Optimizer Service for EasyApply Document Tools
 * Handles file size optimization: image and PDF compression
 */

import { apiClient } from '../config/api';

export interface OptimizationResponse {
  success: boolean;
  optimization_id?: string;
  optimization_type?: string;
  original_filename?: string;
  processed_filename?: string;
  file_type?: string;
  compression_level?: string;
  quality?: number;
  original_size_kb?: number;
  optimized_size_kb?: number;
  compression_ratio?: number;
  size_reduction_percent?: number;
  processing_time_ms?: number;
  download_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export interface BatchOptimizationResponse {
  success: boolean;
  batch_id: string;
  total_files: number;
  optimized_files: Array<{
    optimization_id: string;
    filename: string;
    original_size_kb: number;
    optimized_size_kb: number;
    compression_ratio: number;
  }>;
  total_original_size_kb: number;
  total_optimized_size_kb: number;
  overall_compression_ratio: number;
  processing_time_ms: number;
  download_all_url?: string;
}

class SizeOptimizerService {
  /**
   * Optimize image files
   */
  async optimizeImages(
    files: File[],
    compressionLevel: string = 'medium',
    quality: number = 85,
    maxWidth?: number,
    maxHeight?: number,
    targetSizeKb?: number
  ): Promise<OptimizationResponse | BatchOptimizationResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      // Map UI levels to API levels
      const levelMap: Record<string, string> = { low: 'light', medium: 'medium', high: 'aggressive' };
      const apiLevel = levelMap[compressionLevel] || compressionLevel;
      formData.append('compression_level', apiLevel);
      formData.append('quality', quality.toString());
      
      if (maxWidth) {
        formData.append('max_width', maxWidth.toString());
      }
      if (maxHeight) {
        formData.append('max_height', maxHeight.toString());
      }
      if (typeof targetSizeKb === 'number' && !Number.isNaN(targetSizeKb)) {
        formData.append('target_size_kb', String(targetSizeKb));
      }

      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/optimize-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    }
  }

  /**
   * Optimize PDF files
   */
  async optimizePDFs(
    files: File[],
    compressionLevel: string = 'medium'
  ): Promise<OptimizationResponse | BatchOptimizationResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('compression_level', compressionLevel);

      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/optimize-pdfs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF optimization failed:', error);
      throw error;
    }
  }

  /**
   * Download optimized file
   */
  async downloadFile(optimizationId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/download/${optimizationId}`);
      
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
   * Download batch of optimized files as ZIP
   */
  async downloadBatch(batchId: string): Promise<Blob> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/download-batch/${batchId}`);
      
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
   * Validate file before optimization
   */
  async validateFile(file: File): Promise<{ success: boolean; valid: boolean; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/validate`, {
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
   * Get size optimizer information and capabilities
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/size-optimizer/info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get size optimizer info:', error);
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

export const sizeOptimizerService = new SizeOptimizerService();
