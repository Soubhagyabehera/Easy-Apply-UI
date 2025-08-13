/**
 * Photo Editor Service for EasyApply Document Tools
 * Handles API calls to the backend photo editor endpoints
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ProcessImageRequest {
  width: number;
  height: number;
  output_format: 'JPG' | 'PNG' | 'PDF';
  background_color?: string;
  maintain_aspect_ratio: boolean;
  max_file_size_kb?: number;
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
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/photo-editor`;
  }

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
    
    if (params.background_color) {
      formData.append('background_color', params.background_color);
    }
    
    if (params.max_file_size_kb) {
      formData.append('max_file_size_kb', params.max_file_size_kb.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/process-single`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      return await response.json();
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
    
    if (params.background_color) {
      formData.append('background_color', params.background_color);
    }
    
    if (params.max_file_size_kb) {
      formData.append('max_file_size_kb', params.max_file_size_kb.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/process-batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Batch processing failed');
      }

      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/validate-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Validation failed');
      }

      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/formats`);

      if (!response.ok) {
        throw new Error('Failed to fetch supported formats');
      }

      return await response.json();
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
      const response = await fetch(`${API_BASE_URL}${downloadUrl}`);
      
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
      const response = await fetch(`${API_BASE_URL}${downloadUrl}`);
      
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
    return `${API_BASE_URL}${thumbnailUrl}`;
  }

  /**
   * Health check for the photo editor service
   */
  async healthCheck(): Promise<{ status: string; service: string; features: Record<string, boolean> }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking service health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const photoEditorService = new PhotoEditorService();
export default photoEditorService;
