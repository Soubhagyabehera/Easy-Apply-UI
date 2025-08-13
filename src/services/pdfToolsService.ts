/**
 * PDF Tools Service for EasyApply Document Tools
 * Handles PDF operations: merge, split, compress, etc.
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface PDFOperationResponse {
  success: boolean;
  operation: string;
  file_id?: string;
  batch_id?: string;
  original_filename?: string;
  processed_filename?: string;
  total_pages?: number;
  input_files?: number;
  output_files?: number;
  original_size_mb?: number;
  processed_size_mb?: number;
  compression_ratio?: number;
  compression_level?: string;
  processing_time_ms?: number;
  download_url?: string;
  files?: Array<{
    file_id: string;
    filename: string;
    pages: string;
    size: number;
  }>;
  error?: string;
}

export interface BatchPDFResponse {
  success: boolean;
  operation: string;
  batch_id: string;
  input_filename: string;
  total_pages: number;
  output_files: number;
  files: Array<{
    file_id: string;
    filename: string;
    pages: string;
    size: number;
  }>;
  processing_time_ms: number;
  download_all_url?: string;
}

class PDFToolsService {
  /**
   * Merge multiple PDF files into one
   */
  async mergePDFs(files: File[]): Promise<PDFOperationResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/pdf-tools/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF merge failed:', error);
      throw error;
    }
  }

  /**
   * Split PDF into multiple files
   */
  async splitPDF(
    file: File,
    splitType: string = 'pages',
    pagesPerFile: number = 1,
    pageRanges?: string
  ): Promise<BatchPDFResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('split_type', splitType);
      formData.append('pages_per_file', pagesPerFile.toString());
      
      if (pageRanges) {
        formData.append('page_ranges', pageRanges);
      }

      const response = await fetch(`${API_BASE_URL}/pdf-tools/split`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF split failed:', error);
      throw error;
    }
  }

  /**
   * Compress PDF file
   */
  async compressPDF(
    file: File,
    compressionLevel: string = 'medium'
  ): Promise<PDFOperationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('compression_level', compressionLevel);

      const response = await fetch(`${API_BASE_URL}/pdf-tools/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF compression failed:', error);
      throw error;
    }
  }

  /**
   * Download processed PDF file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf-tools/download/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF download failed:', error);
      throw error;
    }
  }

  /**
   * Download batch of PDF files as ZIP
   */
  async downloadBatch(batchId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf-tools/download-batch/${batchId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF batch download failed:', error);
      throw error;
    }
  }

  /**
   * Validate PDF file before processing
   */
  async validatePDF(file: File): Promise<{ success: boolean; valid: boolean; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/pdf-tools/validate`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('PDF validation failed:', error);
      return { success: false, valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get PDF tools information and capabilities
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf-tools/info`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get PDF tools info:', error);
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

export const pdfToolsService = new PDFToolsService();
