/**
 * Document Manager Service for EasyApply Frontend
 * Handles secure storage and automatic formatting of user documents for job applications
 */

import { apiClient, API_ENDPOINTS } from '../config/api'
import type { AxiosProgressEvent } from 'axios'

// Types and Interfaces
export interface UserDocument {
  document_id: string;
  document_type: string;
  original_filename: string;
  file_size_bytes: number;
  file_format: string;
  upload_date: string;
  is_active: boolean;
}

export interface DocumentUploadResponse {
  success: boolean;
  document_id: string;
  document_type: string;
  original_filename: string;
  file_size_bytes: number;
  file_format: string;
  upload_date: string;
  message: string;
}

export interface DocumentListResponse {
  success: boolean;
  user_id: string;
  total_documents: number;
  documents: UserDocument[];
}

export interface JobDocumentBundle {
  success: boolean;
  job_id: string;
  batch_id: string;
  total_documents: number;
  formatted_documents: FormattedDocument[];
  bundle_download_url: string;
  processing_date: string;
}

export interface FormattedDocument {
  document_id: string;
  document_type: string;
  original_filename: string;
  processed_filename: string;
  processed_file_path: string;
  requirements_applied: DocumentRequirements;
  processing_date: string;
}

export interface DocumentRequirements {
  required?: boolean;
  required_format?: string;
  max_width_px?: number;
  max_height_px?: number;
  min_width_px?: number;
  min_height_px?: number;
  max_size_kb?: number;
  naming_convention?: string;
}

export interface DocumentTypesResponse {
  success: boolean;
  categories: Record<string, string[]>;
  total_types: number;
}

export interface JobRequirementsResponse {
  success: boolean;
  job_id: string;
  requirements: Record<string, DocumentRequirements>;
  total_required_documents: number;
}

export interface DocumentStats {
  success: boolean;
  user_id: string;
  total_documents: number;
  total_size_mb: number;
  category_breakdown: Record<string, number>;
  last_updated: string;
}

class DocumentManagerService {
  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token') || 'demo_token';
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Upload a user document
   */
  async uploadDocument(
    file: File,
    documentType: string,
    onProgress?: (percent: number, loaded: number, total?: number) => void,
    signal?: AbortSignal
  ): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const response = await apiClient.post(API_ENDPOINTS.documentManager.upload, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes - override default timeout for uploads
        // Report upload progress to caller
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (onProgress) {
            const total = (e.total ?? file.size) || file.size;
            const loaded = e.loaded ?? 0;
            const percent = typeof e.progress === 'number'
              ? Math.round(e.progress * 100)
              : total
              ? Math.round((loaded * 100) / total)
              : 0;
            onProgress(percent, loaded, total);
          }
        },
        // Allow caller to cancel
        signal,
      });

      return response.data;
    } catch (error: any) {
      console.error('Document upload error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Upload failed');
    }
  }

  /**
   * Get all documents for the authenticated user
   */
  async getUserDocuments(): Promise<DocumentListResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.documentManager.documents, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Get documents error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch documents');
    }
  }

  /**
   * Delete a user document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.documentManager.document(documentId), {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete document error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Delete failed');
    }
  }

  /**
   * Format documents for a specific job
   */
  async formatDocumentsForJob(
    jobId: string,
    jobRequirements?: Record<string, DocumentRequirements>
  ): Promise<JobDocumentBundle> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.documentManager.formatForJob(jobId),
        jobRequirements || {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Format documents error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Formatting failed');
    }
  }

  /**
   * Download a specific document
   */
  async downloadDocument(documentId: string, filename?: string): Promise<void> {
    try {
      const response = await apiClient.get(
        `/document-manager/download/${documentId}`,
        { 
          responseType: 'blob',
          headers: this.getAuthHeaders(),
        }
      );

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `document_${documentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download document error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Download failed');
    }
  }

  /**
   * Download formatted document bundle
   */
  async downloadDocumentBundle(batchId: string): Promise<void> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.documentManager.downloadBundle(batchId),
        { 
          responseType: 'blob',
          headers: this.getAuthHeaders(),
        }
      );

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_documents_${batchId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download bundle error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Download failed');
    }
  }

  /**
   * Get available document types and categories
   */
  async getDocumentTypes(): Promise<DocumentTypesResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.documentManager.documentTypes);
      return response.data;
    } catch (error: any) {
      console.error('Get document types error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch document types');
    }
  }

  /**
   * Get document requirements for a specific job
   */
  async getJobDocumentRequirements(jobId: string): Promise<JobRequirementsResponse> {
    try {
      const response = await apiClient.get(`/document-manager/job-requirements/${jobId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get job requirements error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch job requirements');
    }
  }

  /**
   * Get document manager statistics
   */
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.documentManager.stats, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Get stats error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch stats');
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ success: boolean; service: string; status: string }> {
    try {
      const response = await apiClient.get('/document-manager/health');
      return response.data;
    } catch (error: any) {
      console.error('Health check error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Health check failed');
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, documentType: string): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const supportedFormats = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `Unsupported format. Use: ${supportedFormats.join(', ')}` 
      };
    }

    // Check document type
    const validDocumentTypes = [
      'resume', 'photo', 'signature',
      'certificate_10th', 'certificate_12th', 'certificate_graduation', 'certificate_post_graduation',
      'aadhaar', 'pan', 'voter_id', 'passport',
      'caste_certificate', 'domicile_certificate', 'income_certificate', 'disability_certificate',
      'experience_certificate', 'relieving_letter'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return { valid: false, error: 'Invalid document type' };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get document type display name
   */
  getDocumentTypeDisplayName(documentType: string): string {
    const displayNames: Record<string, string> = {
      'resume': 'Resume/CV',
      'photo': 'Passport Photo',
      'signature': 'Signature',
      'certificate_10th': '10th Class Certificate',
      'certificate_12th': '12th Class Certificate',
      'certificate_graduation': 'Graduation Certificate',
      'certificate_post_graduation': 'Post Graduation Certificate',
      'aadhaar': 'Aadhaar Card',
      'pan': 'PAN Card',
      'voter_id': 'Voter ID',
      'passport': 'Passport',
      'caste_certificate': 'Caste Certificate',
      'domicile_certificate': 'Domicile Certificate',
      'income_certificate': 'Income Certificate',
      'disability_certificate': 'Disability Certificate',
      'experience_certificate': 'Experience Certificate',
      'relieving_letter': 'Relieving Letter'
    };

    return displayNames[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get document category color for UI
   */
  getDocumentCategoryColor(documentType: string): string {
    const categories = {
      'personal': 'bg-blue-100 text-blue-800',
      'educational': 'bg-green-100 text-green-800',
      'identity': 'bg-purple-100 text-purple-800',
      'other': 'bg-yellow-100 text-yellow-800',
      'experience': 'bg-indigo-100 text-indigo-800'
    };

    const documentCategories = {
      'resume': 'personal', 'photo': 'personal', 'signature': 'personal',
      'certificate_10th': 'educational', 'certificate_12th': 'educational', 
      'certificate_graduation': 'educational', 'certificate_post_graduation': 'educational',
      'aadhaar': 'identity', 'pan': 'identity', 'voter_id': 'identity', 'passport': 'identity',
      'caste_certificate': 'other', 'domicile_certificate': 'other', 
      'income_certificate': 'other', 'disability_certificate': 'other',
      'experience_certificate': 'experience', 'relieving_letter': 'experience'
    };

    const category = documentCategories[documentType as keyof typeof documentCategories] || 'other';
    return categories[category as keyof typeof categories];
  }
}

// Export singleton instance
export const documentManagerService = new DocumentManagerService();
export default documentManagerService;
