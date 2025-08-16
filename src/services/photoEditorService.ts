/**
 * Photo Editor Service for EasyApply Document Tools
 * Handles API calls to the backend photo editor endpoints
 */

import { apiClient, API_ENDPOINTS } from '../config/api';

export interface ProcessImageRequest {
  width: number;
  height: number;
  output_format: 'JPG' | 'PNG' | 'PDF';
  background_color?: string;
  maintain_aspect_ratio: boolean;
  max_file_size_kb?: number;
  remove_background?: boolean;
  auto_face_crop?: boolean;
}

export interface ProcessImageResponse {
  success: boolean;
  original_filename: string;
  processed_filename: string;
  original_dimensions: string;
  new_dimensions: string;
  original_size_kb: number;
  processed_size_kb: number;
  format: string;
  download_url: string;
  thumbnail_url?: string;
  error?: string;
}

export interface BatchProcessResponse {
  total_files: number;
  successful: number;
  failed: number;
  results: ProcessImageResponse[];
  download_all_url?: string;
}

export interface SupportedFormats {
  input_formats: string[];
  output_formats: string[];
  max_file_size_mb: number;
  max_batch_size: number;
}

export interface ValidationResponse {
  valid: boolean;
  filename: string;
  content_type: string;
  size_bytes: number;
  size_kb: number;
  image_info: {
    width: number;
    height: number;
    format: string;
    mode: string;
    size_bytes: number;
  };
}

class PhotoEditorService {

  /**
   * Process a single image with specified parameters
   */
  async processSingleImage(
    file: File,
    params: ProcessImageRequest
  ): Promise<ProcessImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('width', params.width.toString());
    formData.append('height', params.height.toString());
    formData.append('output_format', params.output_format);
    formData.append('maintain_aspect_ratio', params.maintain_aspect_ratio.toString());
    formData.append('remove_background', (params.remove_background || false).toString());
    formData.append('auto_face_crop', (params.auto_face_crop || false).toString());
    
    if (params.background_color) {
      formData.append('background_color', params.background_color);
    }
    
    if (params.max_file_size_kb) {
      formData.append('max_file_size_kb', params.max_file_size_kb.toString());
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.photoEditor.processSingle, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error processing single image:', error);
      throw error;
    }
  }

  /**
   * Process multiple images with the same parameters
   */
  async processBatchImages(
    files: File[],
    params: ProcessImageRequest
  ): Promise<BatchProcessResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('width', params.width.toString());
    formData.append('height', params.height.toString());
    formData.append('output_format', params.output_format);
    formData.append('maintain_aspect_ratio', params.maintain_aspect_ratio.toString());
    formData.append('remove_background', (params.remove_background || false).toString());
    formData.append('auto_face_crop', (params.auto_face_crop || false).toString());
    
    if (params.background_color) {
      formData.append('background_color', params.background_color);
    }
    
    if (params.max_file_size_kb) {
      formData.append('max_file_size_kb', params.max_file_size_kb.toString());
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.photoEditor.processBatch, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error processing batch images:', error);
      throw error;
    }
  }

  /**
   * Validate an image file before processing
   */
  async validateImage(file: File): Promise<ValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post(API_ENDPOINTS.photoEditor.validate, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error validating image:', error);
      throw error;
    }
  }

  /**
   * Get supported formats and limits
   */
  async getSupportedFormats(): Promise<SupportedFormats> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.photoEditor.formats);

      return response.data;
    } catch (error) {
      console.error('Error fetching supported formats:', error);
      throw error;
    }
  }

  /**
   * Download a processed image
   */
  async downloadImage(downloadUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}${downloadUrl}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Download batch of images as ZIP
   */
  async downloadBatchZip(downloadUrl: string, filename: string = 'processed_images.zip'): Promise<void> {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}${downloadUrl}`);
      
      if (!response.ok) {
        throw new Error('Batch download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading batch:', error);
      throw error;
    }
  }

  /**
   * Get thumbnail URL for display
   */
  getThumbnailUrl(thumbnailUrl: string): string {
    return `${apiClient.defaults.baseURL}${thumbnailUrl}`;
  }

  /**
   * Health check for the photo editor service
   */
  async healthCheck(): Promise<{ status: string; service: string; features: Record<string, boolean> }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.photoEditor.health);
      
      return response.data;
    } catch (error) {
      console.error('Error checking service health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const photoEditorService = new PhotoEditorService();
export default photoEditorService;
