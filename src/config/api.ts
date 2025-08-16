import axios, { AxiosInstance } from 'axios'

// API Configuration
// Centralized configuration for all API endpoints and settings

interface ApiConfig {
  baseURL: string
  timeout: number
  headers: {
    'Content-Type': string
  }
}

// Environment-based configuration
const getApiBaseUrl = (): string => {
  // Check for environment variable first (for production builds)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api/v1'
}

export const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}

// Export the base URL for direct access if needed
export const API_BASE_URL = apiConfig.baseURL

// Create centralized API client
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// API endpoints configuration
export const API_ENDPOINTS = {
  // User endpoints
  users: {
    base: '/users',
    auth: {
      google: '/users/auth/google',
    },
    me: '/users/me',
    byId: (id: number) => `/users/${id}`,
    documents: (userId: number) => `/users/${userId}/documents`,
    document: (userId: number, docId: number) => `/users/${userId}/documents/${docId}`,
  },
  
  // Job endpoints
  jobs: {
    base: '/jobs',
    byId: (id: string) => `/jobs/${id}`,
    manual: '/jobs/manual',
    search: {
      advanced: '/jobs/search/advanced',
    },
    discover: '/jobs/discover',
  },
  
  // Document Manager endpoints
  documentManager: {
    base: '/document-manager',
    upload: '/document-manager/upload',
    documents: '/document-manager/documents',
    document: (id: string) => `/document-manager/documents/${id}`,
    formatForJob: (jobId: string) => `/document-manager/format-for-job/${jobId}`,
    downloadBundle: (batchId: string) => `/document-manager/download-bundle/${batchId}`,
    documentTypes: '/document-manager/document-types',
    stats: '/document-manager/stats',
  },
  
  // Document Tools endpoints
  photoEditor: {
    base: '/photo-editor',
    processSingle: '/photo-editor/process-single',
    processBatch: '/photo-editor/process-batch',
    validate: '/photo-editor/validate-image',
    formats: '/photo-editor/formats',
    health: '/photo-editor/health',
    download: (fileId: string) => `/photo-editor/download/${fileId}`,
    thumbnail: (fileId: string) => `/photo-editor/thumbnail/${fileId}`,
    downloadBatch: (batchId: string) => `/photo-editor/download-batch/${batchId}`,
  },
  
  pdfTools: {
    base: '/pdf-tools',
    merge: '/pdf-tools/merge',
    split: '/pdf-tools/split',
    compress: '/pdf-tools/compress',
    watermark: '/pdf-tools/watermark',
  },
  
  formatConverter: {
    base: '/format-converter',
    convert: '/format-converter/convert',
    batch: '/format-converter/batch',
  },
  
  documentScanner: {
    base: '/document-scanner',
    scan: '/document-scanner/scan',
    enhance: '/document-scanner/enhance',
  },
  
  signatureCreator: {
    base: '/signature-creator',
    create: '/signature-creator/create',
    templates: '/signature-creator/templates',
  },
  
  sizeOptimizer: {
    base: '/size-optimizer',
    optimize: '/size-optimizer/optimize',
    batch: '/size-optimizer/batch',
  },
}
