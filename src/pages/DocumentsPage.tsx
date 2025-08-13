import { useState } from 'react'
import { 
  Folder, Upload, Download, Eye, Trash2, 
  CheckCircle, AlertCircle, Plus, FileText, 
  Image, File, Calendar, Shield, User, Settings, 
  Scissors, RotateCw, X, Move, Palette, Camera, 
  PenTool, Combine, Maximize2, FileImage 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { photoEditorService } from '../services/photoEditorService'
import { pdfToolsService } from '../services/pdfToolsService'
import { signatureCreatorService } from '../services/signatureCreatorService'
import { documentScannerService } from '../services/documentScannerService'
import { formatConverterService } from '../services/formatConverterService'
import { sizeOptimizerService } from '../services/sizeOptimizerService'

interface Document {
  id: number
  name: string
  type: 'certificate' | 'photo' | 'signature' | 'identity' | 'other'
  fileName: string
  fileSize: string
  uploadDate: string
  status: 'verified' | 'pending' | 'rejected'
  expiryDate?: string
  isRequired: boolean
  description: string
  maxSize: string
  allowedFormats: string[]
}

export default function DocumentsPage() {
  const { isAuthenticated } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Graduation Certificate',
      type: 'certificate',
      fileName: 'graduation_cert.pdf',
      fileSize: '1.2 MB',
      uploadDate: '2024-01-15',
      status: 'verified',
      isRequired: true,
      description: 'Final degree certificate from recognized university',
      maxSize: '2 MB',
      allowedFormats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 2,
      name: 'Passport Size Photo',
      type: 'photo',
      fileName: 'photo.jpg',
      fileSize: '85 KB',
      uploadDate: '2024-01-15',
      status: 'verified',
      isRequired: true,
      description: 'Recent passport size photograph with white background',
      maxSize: '100 KB',
      allowedFormats: ['JPG', 'PNG']
    },
    {
      id: 3,
      name: 'Digital Signature',
      type: 'signature',
      fileName: 'signature.png',
      fileSize: '45 KB',
      uploadDate: '2024-01-15',
      status: 'verified',
      isRequired: true,
      description: 'Clear digital signature on white background',
      maxSize: '50 KB',
      allowedFormats: ['JPG', 'PNG']
    },
    {
      id: 4,
      name: 'Aadhar Card',
      type: 'identity',
      fileName: 'aadhar.pdf',
      fileSize: '890 KB',
      uploadDate: '2024-01-15',
      status: 'pending',
      isRequired: true,
      description: 'Government issued Aadhar card for identity verification',
      maxSize: '1 MB',
      allowedFormats: ['PDF', 'JPG']
    },
    {
      id: 5,
      name: 'Caste Certificate',
      type: 'certificate',
      fileName: 'caste_cert.pdf',
      fileSize: '1.5 MB',
      uploadDate: '2024-01-10',
      status: 'rejected',
      expiryDate: '2024-12-31',
      isRequired: false,
      description: 'Valid caste certificate for reservation benefits',
      maxSize: '2 MB',
      allowedFormats: ['PDF']
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'tools'>('documents')
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])  
  const [processedFiles, setProcessedFiles] = useState<any[]>([])  
  const [isProcessing, setIsProcessing] = useState(false)  
  const [outputFormat, setOutputFormat] = useState<'JPG' | 'PNG' | 'PDF'>('JPG')  
  const [imageWidth, setImageWidth] = useState<number>(200)  
  const [imageHeight, setImageHeight] = useState<number>(200)
  
  // Additional state for other document tools
  const [pdfOperation, setPdfOperation] = useState<'merge' | 'split' | 'compress'>('merge')
  const [splitPagesPerFile, setSplitPagesPerFile] = useState<number>(1)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [signatureType, setSignatureType] = useState<'text' | 'draw' | 'upload'>('text')
  const [signatureText, setSignatureText] = useState<string>('')
  const [conversionFormat, setConversionFormat] = useState<'JPG' | 'PNG' | 'PDF' | 'DOCX'>('PDF')
  const [enhanceImages, setEnhanceImages] = useState<boolean>(true)
  const [autoCrop, setAutoCrop] = useState<boolean>(true)
  const [optimizationQuality, setOptimizationQuality] = useState<number>(85)

  const documentCategories = [
    { id: 'all', name: 'All Documents', icon: Folder },
    { id: 'certificate', name: 'Certificates', icon: FileText },
    { id: 'photo', name: 'Photographs', icon: Image },
    { id: 'signature', name: 'Signatures', icon: User },
    { id: 'identity', name: 'Identity Proofs', icon: Shield },
    { id: 'other', name: 'Other Documents', icon: File }
  ]

  const requiredDocuments = [
    {
      name: 'Graduation Certificate',
      description: 'Final degree certificate from recognized university',
      maxSize: '2 MB',
      formats: ['PDF', 'JPG', 'PNG'],
      required: true
    },
    {
      name: 'Passport Size Photo',
      description: 'Recent passport size photograph with white background',
      maxSize: '100 KB',
      formats: ['JPG', 'PNG'],
      required: true
    },
    {
      name: 'Digital Signature',
      description: 'Clear digital signature on white background',
      maxSize: '50 KB',
      formats: ['JPG', 'PNG'],
      required: true
    },
    {
      name: 'Identity Proof',
      description: 'Aadhar Card, PAN Card, or Passport',
      maxSize: '1 MB',
      formats: ['PDF', 'JPG'],
      required: true
    },
    {
      name: 'Caste Certificate',
      description: 'For reservation benefits (if applicable)',
      maxSize: '2 MB',
      formats: ['PDF'],
      required: false
    },
    {
      name: 'Income Certificate',
      description: 'For fee concession (if applicable)',
      maxSize: '2 MB',
      formats: ['PDF'],
      required: false
    }
  ]

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedCategory)

  const stats = {
    total: documents.length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <FileText className="h-6 w-6 text-blue-500" />
      case 'photo':
        return <Image className="h-6 w-6 text-green-500" />
      case 'signature':
        return <User className="h-6 w-6 text-purple-500" />
      case 'identity':
        return <Shield className="h-6 w-6 text-orange-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  // Processing functions for document tools
  const processPDFTool = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one PDF file first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      let result;
      
      if (pdfOperation === 'merge') {
        result = await pdfToolsService.mergePDFs(uploadedFiles);
      } else if (pdfOperation === 'split') {
        result = await pdfToolsService.splitPDF(uploadedFiles[0], 'pages', splitPagesPerFile);
      } else if (pdfOperation === 'compress') {
        result = await pdfToolsService.compressPDF(uploadedFiles[0], compressionLevel);
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).original_filename || uploadedFiles[0].name,
          processedName: (result as any).processed_filename || 'processed.pdf',
          format: 'PDF',
          size: (result as any).processed_size_mb ? (result as any).processed_size_mb * 1024 : 0,
          url: (result as any).download_url || '',
          downloadUrl: (result as any).download_url || '',
          success: result.success,
          files: (result as any).files || []
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('PDF processing failed:', error);
      alert(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processSignature = async () => {
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      let result;
      
      if (signatureType === 'text') {
        if (!signatureText.trim()) {
          alert('Please enter text for the signature.');
          return;
        }
        result = await signatureCreatorService.createTextSignature(signatureText);
      } else if (signatureType === 'upload' && uploadedFiles.length > 0) {
        result = await signatureCreatorService.uploadSignature(uploadedFiles[0]);
      } else {
        alert('Please provide signature data.');
        return;
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: result.signature_text || result.original_filename || 'signature',
          processedName: 'signature.png',
          format: 'PNG',
          size: result.file_size_kb || 0,
          url: result.download_url,
          downloadUrl: result.download_url,
          success: result.success
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('Signature creation failed:', error);
      alert(`Signature creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDocumentScan = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one image file first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      const result = await documentScannerService.scanToPDF(uploadedFiles, enhanceImages, autoCrop);
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).original_filename || 'scanned_document',
          processedName: (result as any).processed_filename || 'scanned_document.pdf',
          format: 'PDF',
          size: (result as any).file_size_kb || 0,
          url: (result as any).download_url || '',
          downloadUrl: (result as any).download_url || '',
          success: result.success,
          pages: (result as any).total_pages || uploadedFiles.length
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('Document scan failed:', error);
      alert(`Document scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processFormatConversion = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      let result;
      
      if (conversionFormat === 'PDF' && uploadedFiles.every(f => f.type.startsWith('image/'))) {
        result = await formatConverterService.imagesToPDF(uploadedFiles);
      } else if (['JPG', 'PNG'].includes(conversionFormat) && uploadedFiles[0].type === 'application/pdf') {
        result = await formatConverterService.pdfToImages(uploadedFiles[0], conversionFormat);
      } else {
        result = await formatConverterService.convertDocument(uploadedFiles[0], conversionFormat);
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).original_filename || uploadedFiles[0].name,
          processedName: (result as any).processed_filename || 'converted_file',
          format: (result as any).output_format || conversionFormat,
          size: (result as any).file_size_kb || 0,
          url: (result as any).download_url || '',
          downloadUrl: (result as any).download_url || '',
          success: result.success,
          files: (result as any).files || []
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('Format conversion failed:', error);
      alert(`Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processSizeOptimization = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      let result;
      
      const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));
      const pdfFiles = uploadedFiles.filter(f => f.type === 'application/pdf');
      
      if (imageFiles.length > 0) {
        result = await sizeOptimizerService.optimizeImages(imageFiles, compressionLevel, optimizationQuality);
      } else if (pdfFiles.length > 0) {
        result = await sizeOptimizerService.optimizePDFs(pdfFiles, compressionLevel);
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).original_filename || uploadedFiles[0].name,
          processedName: (result as any).processed_filename || 'optimized_file',
          format: (result as any).file_type || 'optimized',
          size: (result as any).optimized_size_kb || 0,
          originalSize: (result as any).original_size_kb || 0,
          compressionRatio: (result as any).compression_ratio || 1,
          url: (result as any).download_url || '',
          downloadUrl: (result as any).download_url || '',
          success: result.success
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('Size optimization failed:', error);
      alert(`Size optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = async (fileId: string, filename: string, service: string) => {
    try {
      let blob;
      
      switch (service) {
        case 'pdf-tools':
          blob = await pdfToolsService.downloadFile(fileId);
          break;
        case 'signature':
          blob = await signatureCreatorService.downloadSignature(fileId);
          break;
        case 'scanner':
          blob = await documentScannerService.downloadScan(fileId);
          break;
        case 'converter':
          blob = await formatConverterService.downloadFile(fileId);
          break;
        case 'optimizer':
          blob = await sizeOptimizerService.downloadFile(fileId);
          break;
        default:
          throw new Error('Unknown service');
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Folder className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                {isAuthenticated ? 'Document Manager' : 'Document Tools'}
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                {isAuthenticated 
                  ? 'Upload, manage and verify your documents for job applications'
                  : 'Professional document editing tools for job applications'
                }
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Folder className="h-4 w-4 inline mr-2" />
              My Documents
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Document Tools
            </button>
          </div>
        </div>
      )}

      {/* Stats - only show for authenticated users on documents tab */}
      {isAuthenticated && activeTab === 'documents' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0">
              <Folder className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-yellow-100 flex-shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-red-100 flex-shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" />
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Document Tools Section */}
      {(!isAuthenticated || activeTab === 'tools') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Editing Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Photo Editor */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Photo Editor</h3>
              </div>
              <p className="text-gray-600 mb-4">Resize, crop, and enhance passport photos to meet job application requirements.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Crop</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Resize</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Background</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('photo-editor')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Photo Editor
              </button>
            </div>

            {/* PDF Tools */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">PDF Tools</h3>
              </div>
              <p className="text-gray-600 mb-4">Compress, merge, split, and convert PDF documents for applications.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Compress</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Merge</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Split</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('pdf-tools')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open PDF Tools
              </button>
            </div>

            {/* Signature Creator */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Signature Creator</h3>
              </div>
              <p className="text-gray-600 mb-4">Create professional digital signatures for official documents.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Draw</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Type</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Upload</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('signature-creator')}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Signature
              </button>
            </div>

            {/* Document Scanner */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Document Scanner</h3>
              </div>
              <p className="text-gray-600 mb-4">Scan and enhance physical documents using your camera.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Scan</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Enhance</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">OCR</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('document-scanner')}
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Open Scanner
              </button>
            </div>

            {/* Format Converter */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-600 rounded-lg">
                  <RotateCw className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Format Converter</h3>
              </div>
              <p className="text-gray-600 mb-4">Convert between different file formats (JPG, PNG, PDF, etc.).</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">JPG</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">PNG</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">PDF</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('format-converter')}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Convert Files
              </button>
            </div>

            {/* Size Optimizer */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-teal-600 rounded-lg">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Size Optimizer</h3>
              </div>
              <p className="text-gray-600 mb-4">Optimize file sizes to meet application requirements without quality loss.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Compress</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Optimize</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Batch</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('size-optimizer')}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Optimize Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Documents Section - only for authenticated users */}
      {isAuthenticated && activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {documentCategories.map((category) => {
                const Icon = category.icon
                const count = category.id === 'all' 
                  ? documents.length 
                  : documents.filter(doc => doc.type === category.id).length
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h2>
            <div className="space-y-3">
              {requiredDocuments.map((doc, index) => {
                const isUploaded = documents.some(uploaded => 
                  uploaded.name === doc.name && uploaded.status === 'verified'
                )
                
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isUploaded 
                        ? 'bg-green-500 border-green-500' 
                        : doc.required 
                          ? 'border-red-300' 
                          : 'border-gray-300'
                    }`}>
                      {isUploaded && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isUploaded ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {doc.name}
                        </span>
                        {doc.required && !isUploaded && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max: {doc.maxSize} | {doc.formats.join(', ')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Documents' : 
                   documentCategories.find(cat => cat.id === selectedCategory)?.name}
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredDocuments.length} documents
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No documents found in this category.</p>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Your First Document
                  </button>
                </div>
              ) : (
                filteredDocuments.map((document) => (
                  <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getTypeIcon(document.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{document.name}</h3>
                            {document.isRequired && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Required
                              </span>
                            )}
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(document.status)}
                              <span className={`text-sm font-medium capitalize ${
                                document.status === 'verified' ? 'text-green-600' :
                                document.status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {document.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{document.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>File: {document.fileName}</span>
                            <span>Size: {document.fileSize}</span>
                            <span>Uploaded: {document.uploadDate}</span>
                            {document.expiryDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Expires: {document.expiryDate}</span>
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Max size: {document.maxSize} | Allowed: {document.allowedFormats.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Upload Modal - only show for authenticated users */}
      {isAuthenticated && uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select document type</option>
                  <option value="certificate">Certificate</option>
                  <option value="photo">Photograph</option>
                  <option value="signature">Signature</option>
                  <option value="identity">Identity Proof</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="Enter document name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG (Max 2MB)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Modals */}
      {activeToolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeToolModal === 'photo-editor' && 'Photo Editor'}
                {activeToolModal === 'pdf-tools' && 'PDF Tools'}
                {activeToolModal === 'signature-creator' && 'Signature Creator'}
                {activeToolModal === 'document-scanner' && 'Document Scanner'}
                {activeToolModal === 'format-converter' && 'Format Converter'}
                {activeToolModal === 'size-optimizer' && 'Size Optimizer'}
              </h2>
              <button
                onClick={() => {
                  setActiveToolModal(null)
                  setUploadedFiles([])
                  setProcessedFiles([])
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tool Content */}
            <div className="p-6">
              {/* Photo Editor Tool */}
              {activeToolModal === 'photo-editor' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50">
                    {uploadedFiles.length === 0 ? (
                      // Empty state - show upload prompt
                      <div className="p-8 text-center">
                        <Image className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                        <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="photo-upload"
                          onChange={(e) => {
                            if (e.target.files) {
                              setUploadedFiles(Array.from(e.target.files))
                            }
                          }}
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, GIF (Max 10MB each)</p>
                      </div>
                    ) : (
                      // Files uploaded - show previews
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Selected Images ({uploadedFiles.length})
                          </h3>
                          <button
                            onClick={() => setUploadedFiles([])}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        {/* Image Previews Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative bg-white rounded-lg border border-blue-200 overflow-hidden">
                              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  onLoad={(e) => {
                                    // Clean up object URL after image loads
                                    setTimeout(() => {
                                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                    }, 1000);
                                  }}
                                />
                                {/* Remove button */}
                                <button
                                  onClick={() => {
                                    const newFiles = uploadedFiles.filter((_, i) => i !== index);
                                    setUploadedFiles(newFiles);
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="p-2">
                                <p className="text-xs text-gray-600 truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add more files button */}
                        <div className="text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="photo-upload-more"
                            onChange={(e) => {
                              if (e.target.files) {
                                const newFiles = Array.from(e.target.files);
                                setUploadedFiles([...uploadedFiles, ...newFiles]);
                              }
                            }}
                          />
                          <label
                            htmlFor="photo-upload-more"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add More Images
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tool Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Output Format */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FileImage className="h-4 w-4 mr-2" />
                        Output Format
                      </h4>
                      <div className="space-y-3">
                        <select 
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as 'JPG' | 'PNG' | 'PDF')}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="JPG">JPG</option>
                          <option value="PNG">PNG</option>
                          <option value="PDF">PDF</option>
                        </select>
                        <p className="text-xs text-gray-500">
                          {outputFormat === 'JPG' && 'Best for photos with smaller file sizes'}
                          {outputFormat === 'PNG' && 'Best for images with transparency'}
                          {outputFormat === 'PDF' && 'Best for document-style images'}
                        </p>
                      </div>
                    </div>

                    {/* Resize Options */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Resize Image
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                            <input
                              type="number"
                              value={imageWidth}
                              onChange={(e) => setImageWidth(parseInt(e.target.value) || 200)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                            <input
                              type="number"
                              value={imageHeight}
                              onChange={(e) => setImageHeight(parseInt(e.target.value) || 200)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size</label>
                          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="100kb">100 KB</option>
                            <option value="500kb">500 KB</option>
                            <option value="1mb">1 MB</option>
                            <option value="2mb">2 MB</option>
                          </select>
                        </div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-700">Maintain aspect ratio</span>
                        </label>
                      </div>
                    </div>

                    {/* Background Options */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        Change Background
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <button className="aspect-square bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 flex items-center justify-center">
                            <span className="text-xs font-medium">White</span>
                          </button>
                          <button className="aspect-square bg-black border-2 border-gray-300 rounded-lg hover:border-blue-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">Black</span>
                          </button>
                          <button className="aspect-square bg-blue-500 border-2 border-gray-300 rounded-lg hover:border-blue-500 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">Blue</span>
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
                          <input
                            type="color"
                            className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                            defaultValue="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Process Button */}
                  <button 
                    onClick={async () => {
                      if (uploadedFiles.length === 0) {
                        alert('Please upload at least one image first.');
                        return;
                      }
                      
                      setIsProcessing(true);
                      setProcessedFiles([]); // Clear previous results
                      
                      try {
                        const processParams = {
                          width: imageWidth,
                          height: imageHeight,
                          output_format: outputFormat,
                          background_color: undefined, // Will be enhanced later with color picker
                          maintain_aspect_ratio: false, // Will be enhanced later with checkbox
                          max_file_size_kb: undefined // Will be enhanced later with size selector
                        };
                        
                        if (uploadedFiles.length === 1) {
                          // Process single image
                          const result = await photoEditorService.processSingleImage(uploadedFiles[0], processParams);
                          
                          const processedFile = {
                            id: 0,
                            originalName: result.original_filename,
                            processedName: result.processed_filename,
                            format: result.format,
                            dimensions: result.new_dimensions,
                            size: result.processed_size_kb,
                            url: result.thumbnail_url || result.download_url,
                            downloadUrl: result.download_url,
                            success: result.success,
                            error: result.error
                          };
                          
                          setProcessedFiles([processedFile]);
                        } else {
                          // Process batch of images
                          const batchResult = await photoEditorService.processBatchImages(uploadedFiles, processParams);
                          
                          const processedFiles = batchResult.results.map((result, index) => ({
                            id: index,
                            originalName: result.original_filename,
                            processedName: result.processed_filename,
                            format: result.format,
                            dimensions: result.new_dimensions,
                            size: result.processed_size_kb,
                            url: result.thumbnail_url || result.download_url,
                            downloadUrl: result.download_url,
                            success: result.success,
                            error: result.error,
                            batchDownloadUrl: batchResult.download_all_url
                          }));
                          
                          setProcessedFiles(processedFiles);
                        }
                      } catch (error) {
                        console.error('Photo processing failed:', error);
                        alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        setProcessedFiles([]);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing || uploadedFiles.length === 0}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || uploadedFiles.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Images...</span>
                      </>
                    ) : (
                      <span>Process Images ({uploadedFiles.length})</span>
                    )}
                  </button>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-blue-900 font-medium">Processing your images...</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Resizing to {imageWidth}×{imageHeight}px and converting to {outputFormat} format...
                      </p>
                    </div>
                  )}

                  {/* Processed Files Results */}
                  {processedFiles.length > 0 && !isProcessing && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Processed Images ({processedFiles.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {processedFiles.map((file) => (
                          <div key={file.id} className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                              {/* Thumbnail and File Info Container */}
                              <div className="flex items-start space-x-4 flex-1 min-w-0">
                                {/* Thumbnail */}
                                <div className="flex-shrink-0">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-green-200 flex items-center justify-center">
                                    <Image className="h-8 w-8 text-green-600" />
                                  </div>
                                </div>
                                
                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate" title={file.processedName}>
                                    {file.processedName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.dimensions} • {file.format} • {file.size} KB
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Original: {file.originalName}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Download Button */}
                              <div className="flex-shrink-0 w-full sm:w-auto">
                                <button
                                  onClick={async () => {
                                    try {
                                      await photoEditorService.downloadImage(file.downloadUrl, file.processedName);
                                    } catch (error) {
                                      console.error('Download failed:', error);
                                      alert('Download failed. Please try again.');
                                    }
                                  }}
                                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Download All Button */}
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <button 
                          onClick={async () => {
                            try {
                              // Check if batch download URL is available
                              const batchDownloadUrl = processedFiles[0]?.batchDownloadUrl;
                              if (batchDownloadUrl) {
                                await photoEditorService.downloadBatchZip(batchDownloadUrl, `processed_images_${new Date().toISOString().split('T')[0]}.zip`);
                              } else {
                                // Download files individually if no batch URL
                                for (const file of processedFiles) {
                                  if (file.success && file.downloadUrl) {
                                    await photoEditorService.downloadImage(file.downloadUrl, file.processedName);
                                    // Add small delay between downloads
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                  }
                                }
                              }
                            } catch (error) {
                              console.error('Batch download failed:', error);
                              alert('Batch download failed. Please try downloading files individually.');
                            }
                          }}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download All ({processedFiles.length} files)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Format Converter Tool */}
              {activeToolModal === 'format-converter' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-red-50">
                    <RotateCw className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files to Convert</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="convert-upload"
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadedFiles(Array.from(e.target.files))
                        }
                      }}
                    />
                    <label
                      htmlFor="convert-upload"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, PDF, DOCX, TXT</p>
                  </div>

                  {/* Conversion Options */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Convert To</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 text-center">
                        <FileImage className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">JPG</span>
                      </button>
                      <button className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 text-center">
                        <Image className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">PNG</span>
                      </button>
                      <button className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                      <button className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 text-center">
                        <File className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">DOCX</span>
                      </button>
                    </div>
                  </div>

                  {/* Convert Button */}
                  <button 
                    onClick={processFormatConversion}
                    disabled={isProcessing || uploadedFiles.length === 0}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || uploadedFiles.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Converting...</span>
                      </>
                    ) : (
                      <span>Convert Files ({uploadedFiles.length} files)</span>
                    )}
                  </button>
                </div>
              )}

              {/* PDF Tools */}
              {activeToolModal === 'pdf-tools' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  {uploadedFiles.length === 0 ? (
                    <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50">
                      <Combine className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDF Files</h3>
                      <p className="text-gray-600 mb-4">Upload files for PDF operations</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        className="hidden"
                        id="pdf-upload"
                        onChange={(e) => {
                          if (e.target.files) {
                            setUploadedFiles(Array.from(e.target.files))
                          }
                        }}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Supported: PDF, JPG, PNG (Max 50MB total)</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Selected Files ({uploadedFiles.length})</h3>
                        <button
                          onClick={() => setUploadedFiles([])}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              onClick={() => {
                                const newFiles = uploadedFiles.filter((_, i) => i !== index);
                                setUploadedFiles(newFiles);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDF Operations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setPdfOperation('merge')}
                      className={`p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'merge' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <Combine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900">Combine PDFs</span>
                      <p className="text-sm text-gray-600 mt-1">Merge multiple files into one PDF</p>
                    </button>
                    <button 
                      onClick={() => setPdfOperation('split')}
                      className={`p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'split' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <Scissors className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900">Split PDF</span>
                      <p className="text-sm text-gray-600 mt-1">Extract pages from PDF</p>
                    </button>
                    <button 
                      onClick={() => setPdfOperation('compress')}
                      className={`p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'compress' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <Move className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900">Compress PDF</span>
                      <p className="text-sm text-gray-600 mt-1">Reduce file size</p>
                    </button>
                  </div>

                  {/* Operation Options */}
                  {pdfOperation === 'split' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Split Options</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pages per file</label>
                          <input
                            type="number"
                            value={splitPagesPerFile}
                            onChange={(e) => setSplitPagesPerFile(parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {pdfOperation === 'compress' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Compression Level</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setCompressionLevel(level as 'low' | 'medium' | 'high')}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              compressionLevel === level
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            <span className="text-sm font-medium capitalize">{level}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  <button 
                    onClick={processPDFTool}
                    disabled={isProcessing || uploadedFiles.length === 0}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || uploadedFiles.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing PDF...</span>
                      </>
                    ) : (
                      <span>Process PDF ({uploadedFiles.length} files)</span>
                    )}
                  </button>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="text-green-900 font-medium">Processing your PDF...</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {processedFiles.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Processing Complete
                      </h4>
                      <div className="space-y-3">
                        {processedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size / 1024).toFixed(1)} KB
                                  {file.files && file.files.length > 0 && ` • ${file.files.length} files`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'pdf-tools')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Signature Creator Tool */}
              {activeToolModal === 'signature-creator' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <PenTool className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Digital Signature</h3>
                    <p className="text-gray-600">Choose how you'd like to create your signature</p>
                  </div>

                  {/* Signature Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setSignatureType('draw')}
                      className={`p-6 border-2 rounded-xl text-center transition-colors ${
                        signatureType === 'draw' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <PenTool className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <span className="font-semibold text-gray-900 block">Draw</span>
                      <p className="text-sm text-gray-600 mt-1">Draw your signature with mouse or touch</p>
                    </button>
                    <button 
                      onClick={() => setSignatureType('text')}
                      className={`p-6 border-2 rounded-xl text-center transition-colors ${
                        signatureType === 'text' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <span className="font-semibold text-gray-900 block">Type</span>
                      <p className="text-sm text-gray-600 mt-1">Type your name in signature fonts</p>
                    </button>
                    <button 
                      onClick={() => setSignatureType('upload')}
                      className={`p-6 border-2 rounded-xl text-center transition-colors ${
                        signatureType === 'upload' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <Upload className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <span className="font-semibold text-gray-900 block">Upload</span>
                      <p className="text-sm text-gray-600 mt-1">Upload an image of your signature</p>
                    </button>
                  </div>

                  {/* Signature Input Area */}
                  {signatureType === 'text' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Type Your Signature</h4>
                      <input
                        type="text"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-purple-500"
                      />
                      {signatureText && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <p className="text-center text-2xl font-cursive text-purple-600">{signatureText}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {signatureType === 'upload' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Upload Signature Image</h4>
                      {uploadedFiles.length === 0 ? (
                        <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="signature-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setUploadedFiles(Array.from(e.target.files))
                              }
                            }}
                          />
                          <label
                            htmlFor="signature-upload"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Image
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG (Max 5MB)</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Image className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                              <button
                                onClick={() => setUploadedFiles([])}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {signatureType === 'draw' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Draw Your Signature</h4>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
                        <p className="text-gray-500">Drawing canvas coming soon</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Clear</button>
                          <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Undo</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Create Button */}
                  <button 
                    onClick={processSignature}
                    disabled={isProcessing || (signatureType === 'text' && !signatureText.trim()) || (signatureType === 'upload' && uploadedFiles.length === 0)}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || (signatureType === 'text' && !signatureText.trim()) || (signatureType === 'upload' && uploadedFiles.length === 0)
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Signature...</span>
                      </>
                    ) : (
                      <span>Create Signature</span>
                    )}
                  </button>

                  {/* Results */}
                  {processedFiles.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Signature Created
                      </h4>
                      <div className="space-y-3">
                        {processedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              <PenTool className="h-6 w-6 text-purple-600" />
                              <div>
                                <p className="font-medium text-gray-900">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'signature')}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Scanner Tool */}
              {activeToolModal === 'document-scanner' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Scanner</h3>
                    <p className="text-gray-600">Scan physical documents using your camera or upload images</p>
                  </div>

                  {/* Scanner Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button className="p-6 border-2 border-orange-300 rounded-xl hover:bg-orange-50 text-center">
                      <Camera className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <span className="font-semibold text-gray-900 block mb-2">Use Camera</span>
                      <p className="text-sm text-gray-600">Scan documents using your device camera</p>
                    </button>
                    <div className="p-6 border-2 border-dashed border-orange-300 rounded-xl text-center bg-orange-50">
                      <Upload className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <span className="font-semibold text-gray-900 block mb-2">Upload Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="scanner-upload"
                        onChange={(e) => {
                          if (e.target.files) {
                            setUploadedFiles(Array.from(e.target.files))
                          }
                        }}
                      />
                      <label
                        htmlFor="scanner-upload"
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer"
                      >
                        Choose Images
                      </label>
                    </div>
                  </div>

                  {/* Enhancement Options */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Enhancement Options</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-sm text-gray-700">Auto-crop document</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-sm text-gray-700">Enhance contrast</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">Convert to grayscale</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">OCR text extraction</span>
                      </label>
                    </div>
                  </div>

                  {/* Process Button */}
                  <button 
                    onClick={processDocumentScan}
                    disabled={isProcessing || uploadedFiles.length === 0}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || uploadedFiles.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <span>Scan & Process ({uploadedFiles.length} files)</span>
                    )}
                  </button>
                </div>
              )}

              {/* Size Optimizer Tool */}
              {activeToolModal === 'size-optimizer' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  {uploadedFiles.length === 0 ? (
                    <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center bg-teal-50">
                      <Scissors className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files to Optimize</h3>
                      <p className="text-gray-600 mb-4">Reduce file sizes without losing quality</p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="optimize-upload"
                        onChange={(e) => {
                          if (e.target.files) {
                            setUploadedFiles(Array.from(e.target.files))
                          }
                        }}
                      />
                      <label
                        htmlFor="optimize-upload"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, PDF, DOCX</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Selected Files ({uploadedFiles.length})</h3>
                        <div className="space-x-2">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            id="optimize-upload-more"
                            onChange={(e) => {
                              if (e.target.files) {
                                setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])
                              }
                            }}
                          />
                          <label
                            htmlFor="optimize-upload-more"
                            className="inline-flex items-center px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 cursor-pointer"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add More
                          </label>
                          <button
                            onClick={() => setUploadedFiles([])}
                            className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-teal-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <button
                                onClick={() => {
                                  const newFiles = uploadedFiles.filter((_, i) => i !== index)
                                  setUploadedFiles(newFiles)
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimization Settings */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Optimization Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target File Size</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500">
                          <option value="auto">Auto (Best compression)</option>
                          <option value="100kb">Under 100 KB</option>
                          <option value="500kb">Under 500 KB</option>
                          <option value="1mb">Under 1 MB</option>
                          <option value="2mb">Under 2 MB</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quality Level</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          defaultValue="80"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Smaller size</span>
                          <span>Better quality</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optimize Button */}
                  <button 
                    onClick={processSizeOptimization}
                    disabled={isProcessing || uploadedFiles.length === 0}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || uploadedFiles.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Optimizing...</span>
                      </>
                    ) : (
                      <span>Optimize Files ({uploadedFiles.length} files)</span>
                    )}
                  </button>

                  {/* Processed Files Display */}
                  {processedFiles.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                        <h3 className="text-lg font-semibold text-green-800">Optimized Files Ready!</h3>
                        {processedFiles.length > 1 && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium w-full sm:w-auto">
                            Download All
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {processedFiles.map((file, index) => (
                          <div key={index} className="bg-white border border-green-200 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1">
                                <div className="flex items-start sm:items-center space-x-3">
                                  <Scissors className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{file.processedName || file.originalName}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                                      <span>Original: {file.originalSize ? `${(file.originalSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
                                      <span>Optimized: {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                                      {file.compressionRatio && (
                                        <span className="text-green-600 font-medium">
                                          {file.compressionRatio}% smaller
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (file.downloadUrl) {
                                    window.open(`http://localhost:8000/api/v1/${file.downloadUrl}`, '_blank');
                                  }
                                }}
                                className="w-full sm:w-auto sm:ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  )
}
