import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Folder, Upload, Download, Eye, Trash2, 
  CheckCircle, AlertCircle, Plus, FileText, 
  Image, File, Shield, User, Settings, 
  Scissors, RotateCw, X, Camera, 
  PenTool, Combine, Maximize2, FileImage, Info,
  Image as ImageIcon, Award
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { photoEditorService } from '../services/photoEditorService'
import { pdfToolsService } from '../services/pdfToolsService'
import { signatureCreatorService } from '../services/signatureCreatorService'
import { documentScannerService } from '../services/documentScannerService'
import { formatConverterService } from '../services/formatConverterService'
import { sizeOptimizerService } from '../services/sizeOptimizerService'
import { documentManagerService, UserDocument, DocumentTypesResponse } from '../services/documentManagerService'

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
  const location = useLocation()
  const [documents, setDocuments] = useState<Document[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'manager' | 'tools'>('documents')

  // Handle URL parameters to set active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam === 'tools' || tabParam === 'manager' || tabParam === 'documents') {
      setActiveTab(tabParam as 'documents' | 'manager' | 'tools')
    }
  }, [location.search])
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])  
  const [processedFiles, setProcessedFiles] = useState<any[]>([])  
  const [isProcessing, setIsProcessing] = useState(false)  
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);  
  const [outputFormat, setOutputFormat] = useState<'JPG' | 'PNG' | 'PDF'>('JPG')  
  const [imageWidth, setImageWidth] = useState<number>(200)  
  const [imageHeight, setImageHeight] = useState<number>(200)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [maxFileSizeKb, setMaxFileSizeKb] = useState<number>(500)
  
  // Additional state for other document tools
  const [pdfOperation, setPdfOperation] = useState<'merge' | 'split' | 'compress' | 'combine_documents' | 'pdf_to_images' | 'combine_pdfs'>('merge')
  const [splitPagesPerFile, setSplitPagesPerFile] = useState<number>(1)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [signatureType, setSignatureType] = useState<'text' | 'draw' | 'upload'>('text')
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureData, setSignatureData] = useState<string>('')
  const [signatureText, setSignatureText] = useState<string>('')
  const [showSignaturePreview, setShowSignaturePreview] = useState<boolean>(false)
  const [conversionFormat, setConversionFormat] = useState<'JPG' | 'PNG' | 'PDF' | 'DOCX'>('PDF')
  const [enhanceImages, setEnhanceImages] = useState<boolean>(true)
  const [autoCrop, setAutoCrop] = useState<boolean>(true)
  const [optimizationQuality, setOptimizationQuality] = useState<number>(85)
  
  // Document Manager state
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentTypesResponse | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [documentStats, setDocumentStats] = useState<any>(null)
  const [jobDocumentBundle, setJobDocumentBundle] = useState<any>(null)
  const [isFormattingForJob, setIsFormattingForJob] = useState(false)
  const [realDocumentStats, setRealDocumentStats] = useState<any>(null)
  const [showAllUploadedDocs, setShowAllUploadedDocs] = useState(false)

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

  // Helper function to get display name for document types
  const getDocumentDisplayName = (documentType: string): string => {
    const typeMap: { [key: string]: string } = {
      'photo': 'Passport Size Photo',
      'signature': 'Digital Signature',
      'resume': 'Resume/CV',
      'certificate': 'Graduation Certificate',
      'certificate_graduation': 'Graduation Certificate',
      'certificate_domicile': 'Domicile Certificate',
      'pan': 'PAN Card',
      'id_proof': 'Identity Proof',
      'address_proof': 'Address Proof',
      'income_certificate': 'Income Certificate',
      'caste_certificate': 'Caste Certificate',
      'disability_certificate': 'Disability Certificate',
      'experience_letter': 'Experience Letter',
      'marksheet': 'Marksheet',
      'degree_certificate': 'Graduation Certificate',
      'other': 'Other Document'
    }
    return typeMap[documentType] || documentType.charAt(0).toUpperCase() + documentType.slice(1)
  }

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedCategory)

  // Load real document statistics from Document Manager
  useEffect(() => {
    const loadDocumentStats = async () => {
      if (isAuthenticated && activeTab === 'documents') {
        try {
          const [documentsResponse, statsResponse, typesResponse] = await Promise.all([
            documentManagerService.getUserDocuments(),
            documentManagerService.getDocumentStats(),
            documentManagerService.getDocumentTypes()
          ]);
          
          setUserDocuments(documentsResponse.documents);
          setRealDocumentStats(statsResponse);
          setDocumentTypes(typesResponse);
        } catch (error) {
          console.error('Failed to load document statistics:', error);
          // Fallback to mock data if API fails
          setRealDocumentStats({
            total_documents: documents.length,
            verified_documents: documents.filter(doc => doc.status === 'verified').length,
            pending_documents: documents.filter(doc => doc.status === 'pending').length,
            rejected_documents: documents.filter(doc => doc.status === 'rejected').length
          });
        }
      }
    };
    
    loadDocumentStats();
  }, [isAuthenticated, activeTab]);

  // Calculate stats from real data or fallback to mock data
  const stats = realDocumentStats ? {
    total: realDocumentStats.total_documents || 0,
    verified: realDocumentStats.verified_documents || userDocuments.filter(doc => doc.is_active).length,
    pending: realDocumentStats.pending_documents || 0,
    rejected: realDocumentStats.rejected_documents || 0
  } : {
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
      case 'degree_certificate':
      case 'caste_certificate':
      case 'income_certificate':
      case 'disability_certificate':
        return <FileText className="h-6 w-6 text-blue-500" />
      case 'photo':
        return <Image className="h-6 w-6 text-green-500" />
      case 'signature':
        return <User className="h-6 w-6 text-purple-500" />
      case 'identity':
      case 'id_proof':
        return <Shield className="h-6 w-6 text-orange-500" />
      case 'resume':
      case 'experience_letter':
        return <FileText className="h-6 w-6 text-indigo-500" />
      case 'marksheet':
        return <FileText className="h-6 w-6 text-teal-500" />
      case 'address_proof':
        return <Shield className="h-6 w-6 text-yellow-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  // Handle document viewing
  const handleViewDocument = async (document: any) => {
    try {
      if (document.document_id) {
        // For real documents from backend, we need to implement view functionality
        console.log('Viewing document:', document.document_id)
        // TODO: Implement document viewing with backend API
        alert('Document viewing functionality will be implemented soon')
      } else {
        // For uploaded files
        if (document instanceof File) {
          const url = URL.createObjectURL(document)
          window.open(url, '_blank')
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      alert('Failed to view document')
    }
  }

  // Handle document downloading
  const handleDownloadDocument = async (document: any) => {
    try {
      if (document.document_id) {
        // For real documents from backend - use the service method with proper auth
        console.log('Downloading document:', document.document_id)
        await documentManagerService.downloadDocument(
          document.document_id, 
          document.original_filename || 'document'
        )
      } else {
        // For uploaded files
        if (document instanceof File) {
          const url = URL.createObjectURL(document)
          const a = window.document.createElement('a')
          a.href = url
          a.download = document.name
          window.document.body.appendChild(a)
          a.click()
          window.document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert(`Failed to download document: ${error.message}`)
    }
  }

  // Processing functions for document tools
  const processPDFTool = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file first.');
      return;
    }
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      let result;
      
      if (pdfOperation === 'merge') {
        result = await pdfToolsService.mergePDFs(uploadedFiles);
      } else if (pdfOperation === 'compress') {
        result = await pdfToolsService.compressPDF(uploadedFiles[0], compressionLevel);
      } else if (pdfOperation === 'combine_documents') {
        result = await pdfToolsService.combineDocumentsToPDF(uploadedFiles);
      } else if (pdfOperation === 'pdf_to_images') {
        result = await pdfToolsService.pdfToImages(uploadedFiles[0], outputFormat.toLowerCase(), 150);
      } else if (pdfOperation === 'combine_pdfs') {
        result = await pdfToolsService.combinePDFs(uploadedFiles);
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).original_filename || (result as any).input_filename || uploadedFiles[0].name,
          processedName: pdfOperation === 'pdf_to_images' ? 'images.zip' : ((result as any).processed_filename || 'processed.pdf'),
          format: pdfOperation === 'pdf_to_images' ? 'Images' : 'PDF',
          size: pdfOperation === 'pdf_to_images' 
            ? ((result as any).images || []).reduce((total: number, img: any) => total + (img.size || 0), 0) / 1024
            : ((result as any).processed_size_mb ? (result as any).processed_size_mb * 1024 : 0),
          url: (result as any).download_url || (result as any).download_all_url || '',
          downloadUrl: (result as any).download_url || (result as any).download_all_url || '',
          success: result.success,
          files: (result as any).files || (result as any).images || [],
          batchId: (result as any).batch_id
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('PDF processing failed:', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      } else if (signatureType === 'draw') {
        if (!signatureData) {
          alert('Please draw your signature first.');
          return;
        }
        result = await signatureCreatorService.createDrawnSignature(signatureData);
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
          downloadUrl: result.signature_id,
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

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    console.log('=== CAPTURE PHOTO STARTED ===');
    
    try {
      if (!cameraStream) {
        console.error('No camera stream available');
        alert('Camera not available. Please try again.');
        return;
      }
      
      const video = document.getElementById('camera-video') as HTMLVideoElement;
      if (!video) {
        console.error('Camera video element not found');
        alert('Camera video not found. Please restart camera.');
        return;
      }

      console.log('Video state:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        ended: video.ended,
        currentTime: video.currentTime
      });

      // Force video to play if paused
      if (video.paused) {
        try {
          await video.play();
          console.log('Video resumed playing');
        } catch (e) {
          console.error('Failed to resume video:', e);
        }
      }

      // Wait for video to be ready with multiple checks
      let retryCount = 0;
      const maxRetries = 10;
      
      while ((video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) && retryCount < maxRetries) {
        console.log(`Video not ready, retry ${retryCount + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        retryCount++;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video still not ready after retries');
        alert('Camera video not ready. Please try again.');
        return;
      }

      console.log('Creating canvas for capture...');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Failed to get canvas context');
        alert('Canvas not supported. Please try a different browser.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
      
      // Draw the current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('Video frame drawn to canvas');
      
      // Test canvas data to ensure it's not empty
      const imageData = context.getImageData(0, 0, Math.min(10, canvas.width), Math.min(10, canvas.height));
      const hasData = imageData.data.some(pixel => pixel !== 0);
      console.log('Canvas has image data:', hasData);
      
      if (!hasData) {
        throw new Error('Canvas appears to be empty - video frame may not have been captured properly');
      }
      
      // Convert to blob with timeout and better error handling
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Canvas toBlob timeout after 5 seconds'));
        }, 5000);
        
        try {
          canvas.toBlob((result) => {
            clearTimeout(timeout);
            console.log('toBlob callback executed, result:', result ? 'success' : 'null');
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Canvas toBlob returned null - browser may not support JPEG encoding'));
            }
          }, 'image/jpeg', 0.9);
          console.log('toBlob method called successfully');
        } catch (err) {
          clearTimeout(timeout);
          console.error('toBlob method threw error:', err);
          reject(err);
        }
      });
      
      if (blob) {
        const timestamp = Date.now();
        const fileName = `captured-${timestamp}.jpg`;
        
        // Create file object with proper constructor check
        let file: File;
        try {
          if (typeof File !== 'undefined' && File.prototype && File.prototype.constructor === File) {
            file = new File([blob], fileName, { type: 'image/jpeg' });
          } else {
            // Fallback for environments where File constructor is not available
            file = new Blob([blob], { type: 'image/jpeg' }) as File;
            Object.defineProperty(file, 'name', { value: fileName, writable: false });
            Object.defineProperty(file, 'lastModified', { value: timestamp, writable: false });
          }
        } catch (fileError) {
          console.error('File constructor error:', fileError);
          // Create a blob with file-like properties
          file = Object.assign(blob, {
            name: fileName,
            lastModified: timestamp
          }) as File;
        }
        
        console.log('Photo captured successfully:', {
          name: file.name || fileName,
          size: file.size,
          type: file.type
        });
        
        // Add to uploaded files
        setUploadedFiles(prev => {
          const newFiles = [...prev, file];
          console.log('Files updated, total count:', newFiles.length);
          return newFiles;
        });
        
        // Show success message
        alert(`✅ Photo captured successfully!\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB`);
        
        // Stop camera immediately
        console.log('Stopping camera...');
        stopCamera();
        console.log('=== CAPTURE COMPLETE ===');
        
      } else {
        console.error('Failed to create blob from canvas');
        alert('❌ Failed to capture photo. Please try again.');
      }
      
    } catch (error) {
      console.error('DETAILED ERROR during photo capture:', error);
      console.error('Error stack:', (error as Error).stack);
      console.error('Error message:', (error as Error).message);
      alert(`❌ Error capturing photo: ${(error as Error).message}. Please try again.`);
    }
  };

  const processDocumentScan = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    setProcessedFiles([]);
    
    try {
      console.log('Starting document scan with files:', uploadedFiles.map(f => f.name));
      
      // Get enhancement options from the Document Scanner modal
      const scannerModal = document.querySelector('[data-modal="document-scanner"]');
      const autoCrop = (scannerModal?.querySelector('input[type="checkbox"]:nth-of-type(1)') as HTMLInputElement)?.checked ?? true;
      const enhanceContrast = (scannerModal?.querySelector('input[type="checkbox"]:nth-of-type(2)') as HTMLInputElement)?.checked ?? true;
      const convertToGrayscale = (scannerModal?.querySelector('input[type="checkbox"]:nth-of-type(3)') as HTMLInputElement)?.checked ?? false;
      const ocrExtraction = (scannerModal?.querySelector('input[type="checkbox"]:nth-of-type(4)') as HTMLInputElement)?.checked ?? false;
      
      const enhancementLevel = enhanceContrast ? 'medium' : 'light';
      const outputFormat = 'PDF';
      
      console.log('Scan options:', { enhancementLevel, autoCrop, outputFormat });
      
      const result = await documentScannerService.scanToPDF(uploadedFiles, {
        outputFormat,
        enhancementLevel,
        autoCrop,
        pageSize: 'A4'
      });
      
      console.log('Scan result:', result);
      
      if (result.success && result.scan_id) {
        const processedFile = {
          processedName: result.output_filename || 'scanned_document.pdf',
          format: result.output_format || 'PDF',
          size: (result.output_size_mb || 0) * 1024, // Convert MB to KB
          url: result.download_url || '',
          downloadUrl: result.scan_id,
          success: result.success,
          pages: result.input_files || uploadedFiles.length
        };
        setProcessedFiles([processedFile]);
        console.log('Processed file added:', processedFile);
      } else {
        throw new Error(result.error || 'Scanning failed - no scan ID returned');
      }
    } catch (error) {
      console.error('Document scanning failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Scanning failed: ${errorMessage}`);
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
      } else if (['JPG', 'PNG'].includes(conversionFormat)) {
        result = await formatConverterService.convertToImage(uploadedFiles[0], conversionFormat);
      } else {
        result = await formatConverterService.convertDocument(uploadedFiles[0], conversionFormat);
      }
      
      if (result && result.success) {
        const processedFile = {
          id: 0,
          originalName: (result as any).input_filename || uploadedFiles[0].name,
          processedName: (result as any).output_filename || 'converted_file',
          format: (result as any).output_format || conversionFormat,
          size: (result as any).output_size_mb ? (result as any).output_size_mb * 1024 : 0,
          url: `/format-converter/download/${(result as any).conversion_id}`,
          downloadUrl: `/format-converter/download/${(result as any).conversion_id}`,
          success: result.success,
          files: (result as any).files || [],
          conversionId: (result as any).conversion_id
        };
        setProcessedFiles([processedFile]);
      }
    } catch (error) {
      console.error('Format conversion failed:', error);
      alert('Format conversion failed. Please try again.');
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
          // Check if this is an image batch download
          if (filename === 'images.zip' && processedFiles.length > 0 && processedFiles[0].batchId) {
            blob = await pdfToolsService.downloadImageBatch(processedFiles[0].batchId);
          } else {
            // Extract file ID from download URL if it's a full path
            const actualFileId = fileId.includes('/') ? fileId.split('/').pop() || fileId : fileId;
            blob = await pdfToolsService.downloadFile(actualFileId);
          }
          break;
        case 'signature':
          blob = await signatureCreatorService.downloadSignature(fileId);
          break;
        case 'scanner':
          blob = await documentScannerService.downloadScan(fileId);
          break;
        case 'converter':
          // Extract conversion ID from download URL if it's a full path
          const actualConversionId = fileId.includes('/') ? fileId.split('/').pop() || fileId : fileId;
          blob = await formatConverterService.downloadFile(actualConversionId);
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

  // Document Manager functions
  const loadUserDocuments = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingDocuments(true);
    try {
      const response = await documentManagerService.getUserDocuments();
      setUserDocuments(response.documents);
      
      // Load document stats
      const stats = await documentManagerService.getDocumentStats();
      setDocumentStats(stats);
    } catch (error) {
      console.error('Failed to load user documents:', error);
      alert('Failed to load documents. Please try again.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const types = await documentManagerService.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Failed to load document types:', error);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!selectedDocumentType) {
      alert('Please select a document type first.');
      return;
    }

    const validation = documentManagerService.validateFile(file, selectedDocumentType);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await documentManagerService.uploadDocument(file, selectedDocumentType);
      alert(`Document uploaded successfully: ${result.original_filename}`);
      await loadUserDocuments(); // Refresh the list
      setSelectedDocumentType('');
    } catch (error) {
      console.error('Document upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentManagerService.deleteDocument(documentId);
      alert('Document deleted successfully.');
      await loadUserDocuments(); // Refresh the list
    } catch (error) {
      console.error('Document deletion failed:', error);
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFormatForJob = async (jobId: string = 'demo_job_123') => {
    setIsFormattingForJob(true);
    try {
      const result = await documentManagerService.formatDocumentsForJob(jobId);
      setJobDocumentBundle(result);
      alert(`Documents formatted successfully! ${result.total_documents} documents ready for download.`);
    } catch (error) {
      console.error('Document formatting failed:', error);
      alert(`Formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFormattingForJob(false);
    }
  };

  const handleDownloadBundle = async () => {
    if (!jobDocumentBundle) return;
    
    try {
      await documentManagerService.downloadDocumentBundle(jobDocumentBundle.batch_id);
    } catch (error) {
      console.error('Bundle download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    if (isAuthenticated && activeTab === 'manager') {
      loadUserDocuments();
      loadDocumentTypes();
    }
  }, [isAuthenticated, activeTab]);

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
              onClick={() => setActiveTab('manager')}
              className="bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Document Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Folder className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Documents</span>
              <span className="sm:hidden">Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Document Manager</span>
              <span className="sm:hidden">Manager</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tools</span>
              <span className="sm:hidden">Tools</span>
            </button>
          </div>
        </div>
      )}


      {/* Document Tools Section */}
      {(!isAuthenticated || activeTab === 'tools') && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Document Editing Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Photo Editor */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200 flex flex-col h-full">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-600 rounded-lg flex-shrink-0">
                  <Image className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Photo Editor</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 flex-grow">Advanced AI-powered photo editing with face detection, background removal, and smart cropping for perfect ID photos.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">AI Background</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Face Detection</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Smart Crop</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Size Control</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('photo-editor')}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium mt-auto"
              >
                Open Photo Editor
              </button>
            </div>

            {/* PDF Tools */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200 flex flex-col h-full">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-600 rounded-lg flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">PDF Tools</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 flex-grow">Compress, merge, split, and convert PDF documents for applications.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Compress</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Merge</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Split</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('pdf-tools')}
                className="w-full bg-green-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium mt-auto"
              >
                Open PDF Tools
              </button>
            </div>

            {/* Signature Creator */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200 flex flex-col h-full">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-600 rounded-lg flex-shrink-0">
                  <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Signature Creator</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 flex-grow">Create professional digital signatures for official documents.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Draw</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Type</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Upload</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('signature-creator')}
                className="w-full bg-purple-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium mt-auto"
              >
                Create Signature
              </button>
            </div>

            {/* Document Scanner */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-600 rounded-lg flex-shrink-0">
                  <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Document Scanner</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Scan and enhance physical documents using your camera.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Scan</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Enhance</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">OCR</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('document-scanner')}
                className="w-full bg-orange-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium"
              >
                Open Scanner
              </button>
            </div>

            {/* Format Converter */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-600 rounded-lg flex-shrink-0">
                  <RotateCw className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Format Converter</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Convert between different file formats (JPG, PNG, PDF, etc.).</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">JPG</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">PNG</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">PDF</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('format-converter')}
                className="w-full bg-red-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium"
              >
                Convert Files
              </button>
            </div>

            {/* Size Optimizer */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-teal-200">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-teal-600 rounded-lg flex-shrink-0">
                  <Scissors className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Size Optimizer</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Optimize file sizes to meet application requirements without quality loss.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Compress</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Optimize</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Batch</span>
              </div>
              <button 
                onClick={() => setActiveToolModal('size-optimizer')}
                className="w-full bg-teal-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base font-medium"
              >
                Optimize Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Manager Section - only for authenticated users */}
      {isAuthenticated && activeTab === 'manager' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Document Manager Stats */}
          {documentStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Documents</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{documentStats.total_documents}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0">
                    <Folder className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Size</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{documentStats.total_size_mb} MB</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Personal</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{documentStats.category_breakdown?.personal || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-purple-100 flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Educational</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{documentStats.category_breakdown?.educational || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-orange-100 flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Upload Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upload New Document</h2>
              <button
                onClick={() => loadUserDocuments()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium self-start sm:self-auto"
                disabled={isLoadingDocuments}
              >
                {isLoadingDocuments ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select document type</option>
                  {documentTypes && Object.entries(documentTypes.categories).map(([category, types]) => (
                    <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {documentManagerService.getDocumentTypeDisplayName(type)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocumentUpload(file);
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, JPG, PNG, DOC, DOCX (Max 50MB)
                </p>
              </div>
            </div>
          </div>

          {/* User Documents List */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">My Documents</h2>
                <div className="text-sm text-gray-500">
                  {userDocuments.length} documents
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {isLoadingDocuments ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm sm:text-base">Loading documents...</p>
                </div>
              ) : userDocuments.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg mb-2">No documents uploaded yet.</p>
                  <p className="text-gray-400 text-sm">Upload your first document to get started.</p>
                </div>
              ) : (
                userDocuments.map((doc) => (
                  <div key={doc.document_id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg ${documentManagerService.getDocumentCategoryColor(doc.document_type)}`}>
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {documentManagerService.getDocumentTypeDisplayName(doc.document_type)}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${documentManagerService.getDocumentCategoryColor(doc.document_type)} self-start sm:self-auto`}>
                              {doc.document_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                            <span>File: {doc.original_filename}</span>
                            <span>Size: {documentManagerService.formatFileSize(doc.file_size_bytes)}</span>
                            <span className="hidden sm:inline">Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</span>
                            <span className="sm:hidden">Uploaded: {new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <button 
                          onClick={() => handleDocumentDelete(doc.document_id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job Document Formatting */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Format Documents for Job</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Automatically format and package your documents according to job requirements.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleFormatForJob()}
                disabled={isFormattingForJob || userDocuments.length === 0}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isFormattingForJob ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Formatting...</span>
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    <span>Format for Demo Job</span>
                  </>
                )}
              </button>

              {jobDocumentBundle && (
                <button
                  onClick={handleDownloadBundle}
                  className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Bundle</span>
                </button>
              )}
            </div>

            {jobDocumentBundle && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 text-sm sm:text-base">Documents Ready!</span>
                </div>
                <p className="text-green-700 text-xs sm:text-sm">
                  {jobDocumentBundle.total_documents} documents formatted and packaged for download.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Documents Dashboard - only for authenticated users */}
      {isAuthenticated && activeTab === 'documents' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Document Status Overview */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Document Status Overview</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                    <Folder className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Total</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-600">Verified</p>
                    <p className="text-lg sm:text-xl font-bold text-green-900">{stats.verified}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-yellow-600 rounded-lg">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-lg sm:text-xl font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-red-600 rounded-lg">
                    <X className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-red-600">Missing</p>
                    <p className="text-lg sm:text-xl font-bold text-red-900">
                      {documentTypes ? 
                        (documentTypes.total_types - userDocuments.length) : 
                        requiredDocuments.filter(doc => !userDocuments.some(uploaded => getDocumentDisplayName(uploaded.document_type) === doc.name && uploaded.is_active)).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Document Completion</span>
                <span className="text-sm text-gray-500">
                  {documentTypes ? 
                    Math.round((userDocuments.length / Math.max(documentTypes.total_types, 1)) * 100) : 
                    Math.round((userDocuments.length / Math.max(requiredDocuments.length, 1)) * 100)
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.min(100, documentTypes ? 
                      Math.round((userDocuments.length / Math.max(documentTypes.total_types, 1)) * 100) : 
                      Math.round((userDocuments.length / Math.max(requiredDocuments.length, 1)) * 100)
                    )}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Document Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Uploaded Documents */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs sm:text-sm rounded-full font-medium">
                    {userDocuments.length} uploaded
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {userDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                    <button
                      onClick={() => setActiveTab('manager')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Upload First Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(showAllUploadedDocs ? userDocuments : userDocuments.slice(0, 5)).map((document, index) => (
                      <div key={document.document_id || document.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getDocumentDisplayName(document.document_type || document.type).includes('Photo') ? (
                              <Image className="h-4 w-4 text-blue-600" />
                            ) : getDocumentDisplayName(document.document_type || document.type).includes('Certificate') ? (
                              <Award className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{getDocumentDisplayName(document.document_type || document.type)}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {document.status || 'Active'}
                              </span>
                              <span>•</span>
                              <span>{document.file_size_bytes ? `${(document.file_size_bytes / 1024).toFixed(1)} KB` : document.fileSize || 'Unknown size'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewDocument(document)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View document"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(document)}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download document"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {userDocuments.length > 5 && (
                      <button 
                        onClick={() => setShowAllUploadedDocs(!showAllUploadedDocs)}
                        className="w-full text-center py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {showAllUploadedDocs ? 'Show less' : `View all ${userDocuments.length} documents`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Missing Documents */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Missing Documents</h3>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs sm:text-sm rounded-full font-medium">
                    {documentTypes ? 
                      (documentTypes.total_types - userDocuments.length) : 
                      requiredDocuments.filter(doc => !userDocuments.some(uploaded => getDocumentDisplayName(uploaded.document_type) === doc.name && uploaded.is_active)).length
                    } missing
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {documentTypes && documentTypes.total_types <= userDocuments.length ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">All document types uploaded!</p>
                    <p className="text-gray-500 text-sm mt-1">You can upload more documents in Document Manager</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentTypes ? (
                      // Show missing document types from Document Manager
                      Object.entries(documentTypes.categories).map(([category, types]) => 
                        types.filter(docType => !userDocuments.some(uploaded => uploaded.document_type === docType)).map(docType => (
                          <div key={docType} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center border-red-400 bg-red-100">
                                <X className="h-2.5 w-2.5 text-red-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900">{getDocumentDisplayName(docType)}</p>
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">{category}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Document type: {docType}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Supported formats: PDF, JPG, PNG, DOC, DOCX
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('manager')
                                setSelectedDocumentType(docType)
                              }}
                              className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex-shrink-0 min-w-0"
                            >
                              Upload
                            </button>
                          </div>
                        ))
                      ).flat()
                    ) : (
                      // Fallback to hardcoded required documents
                      requiredDocuments
                        .filter(doc => !userDocuments.some(uploaded => getDocumentDisplayName(uploaded.document_type) === doc.name && uploaded.is_active))
                        .map((doc, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              doc.required ? 'border-red-400 bg-red-100' : 'border-gray-300'
                            }`}>
                              {doc.required && <X className="h-2.5 w-2.5 text-red-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                {doc.required && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">Required</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Max: {doc.maxSize} | Formats: {doc.formats.join(', ')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('manager')
                              const docTypeMapping: { [key: string]: string } = {
                                'Graduation Certificate': 'certificate_graduation',
                                'Passport Size Photo': 'photo',
                                'Digital Signature': 'signature',
                                'Identity Proof': 'pan'
                              }
                              setSelectedDocumentType(docTypeMapping[doc.name] || 'other')
                            }}
                            className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex-shrink-0 min-w-0"
                          >
                            Upload
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => setActiveTab('manager')}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-3 sm:p-4 text-left transition-colors"
              >
                <Plus className="h-5 w-5 mb-2" />
                <p className="font-medium text-sm sm:text-base">Upload Document</p>
                <p className="text-xs sm:text-sm text-white/80">Add new documents</p>
              </button>
              <button
                onClick={() => setActiveTab('manager')}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-3 sm:p-4 text-left transition-colors"
              >
                <Upload className="h-5 w-5 mb-2" />
                <p className="font-medium text-sm sm:text-base">Document Manager</p>
                <p className="text-xs sm:text-sm text-white/80">Manage & format docs</p>
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-3 sm:p-4 text-left transition-colors"
              >
                <Settings className="h-5 w-5 mb-2" />
                <p className="font-medium text-sm sm:text-base">Document Tools</p>
                <p className="text-xs sm:text-sm text-white/80">Edit & optimize files</p>
              </button>
              <button className="bg-white/20 hover:bg-white/30 rounded-lg p-3 sm:p-4 text-left transition-colors">
                <Download className="h-5 w-5 mb-2" />
                <p className="font-medium text-sm sm:text-base">Download All</p>
                <p className="text-xs sm:text-sm text-white/80">Get document bundle</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - only show for authenticated users */}
      {isAuthenticated && uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (KB)</label>
                          <select 
                            value={maxFileSizeKb}
                            onChange={(e) => setMaxFileSizeKb(parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={50}>50 KB (Ultra Compressed)</option>
                            <option value={100}>100 KB (High Compression)</option>
                            <option value={250}>250 KB (Medium Compression)</option>
                            <option value={500}>500 KB (Low Compression)</option>
                            <option value={1024}>1 MB (Minimal Compression)</option>
                            <option value={2048}>2 MB (Maximum Size)</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Range: 10KB - 2MB (enforced automatically)
                          </p>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={maintainAspectRatio}
                              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">Maintain Aspect Ratio</span>
                              <p className="text-xs text-gray-600">Keep original proportions (recommended for photos)</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>



                  </div>

                  {/* Advanced Processing Options */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Processing Summary
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Output Size:</span>
                        <span className="font-medium">{imageWidth}×{imageHeight}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium">{outputFormat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max File Size:</span>
                        <span className="font-medium">{maxFileSizeKb} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aspect Ratio:</span>
                        <span className="font-medium">{maintainAspectRatio ? 'Maintained' : 'Stretched'}</span>
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
                        const params = {
                          width: imageWidth,
                          height: imageHeight,
                          output_format: outputFormat,
                          maintain_aspect_ratio: maintainAspectRatio,
                          max_file_size_kb: maxFileSizeKb
                        };
                        
                        if (uploadedFiles.length === 1) {
                          // Process single image
                          const result = await photoEditorService.processSingleImage(uploadedFiles[0], params);
                          
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
                          const batchResult = await photoEditorService.processBatchImages(uploadedFiles, params);
                          
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

                  {/* Advanced Results Preview */}
                  {processedFiles.length > 0 && !isProcessing && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-green-900 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Processing Complete ({processedFiles.length} {processedFiles.length === 1 ? 'image' : 'images'})
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                          <span className="px-2 py-1 bg-green-100 rounded-full">
                            Standard Processing
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {processedFiles.map((file, index) => (
                          <div key={file.id} className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                            {/* Before/After Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                              {/* Original Image */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-gray-900 flex items-center">
                                  <FileImage className="h-4 w-4 mr-2" />
                                  Original
                                </h5>
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                                  {uploadedFiles[index] && (
                                    <img
                                      src={URL.createObjectURL(uploadedFiles[index])}
                                      alt="Original"
                                      className="w-full h-full object-contain"
                                    />
                                  )}
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    {file.originalName}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>Size: {Math.round(uploadedFiles[index]?.size / 1024)} KB</div>
                                  <div>Format: {uploadedFiles[index]?.type.split('/')[1].toUpperCase()}</div>
                                </div>
                              </div>
                              
                              {/* Processed Image */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-gray-900 flex items-center">
                                  <Camera className="h-4 w-4 mr-2 text-green-600" />
                                  Processed
                                </h5>
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 border-green-200">
                                  {file.thumbnailUrl ? (
                                    <img
                                      src={file.thumbnailUrl}
                                      alt="Processed"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto flex items-center justify-center">
                                          <Image className="h-8 w-8 text-green-600" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">Preview Ready</p>
                                        <p className="text-xs text-gray-500">Click download to view</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    {file.processedName}
                                  </div>
                                </div>
                                <div className="text-xs text-green-700 space-y-1 bg-green-50 p-2 rounded">
                                  <div className="flex justify-between">
                                    <span>Size:</span>
                                    <span className="font-medium">{file.size} KB</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Dimensions:</span>
                                    <span className="font-medium">{file.dimensions}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Format:</span>
                                    <span className="font-medium">{file.format}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={async () => {
                                  try {
                                    await photoEditorService.downloadImage(file.downloadUrl, file.processedName);
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    alert('Download failed. Please try again.');
                                  }
                                }}
                                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Processed Image
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    // Fetch the processed image for preview from backend server
                                    const backendUrl = `http://localhost:8000/api/v1${file.downloadUrl}`;
                                    const response = await fetch(backendUrl);
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const imageUrl = URL.createObjectURL(blob);
                                      setPreviewImage(imageUrl);
                                      setShowPreviewModal(true);
                                    } else {
                                      alert('Failed to load preview. Please try downloading the image.');
                                    }
                                  } catch (error) {
                                    console.error('Preview failed:', error);
                                    alert('Failed to load preview. Please try downloading the image.');
                                  }
                                }}
                                className="px-4 py-3 bg-white border border-green-300 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-2 inline" />
                                Preview
                              </button>
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

                  {/* Uploaded Files Display */}
                  {uploadedFiles.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Selected Files ({uploadedFiles.length})</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newFiles = uploadedFiles.filter((_, i) => i !== index);
                                setUploadedFiles(newFiles);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversion Options */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Convert To</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button 
                        onClick={() => setConversionFormat('JPG')}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          conversionFormat === 'JPG' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
                        <FileImage className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">JPG</span>
                      </button>
                      <button 
                        onClick={() => setConversionFormat('PNG')}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          conversionFormat === 'PNG' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Image className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">PNG</span>
                      </button>
                      <button 
                        onClick={() => setConversionFormat('PDF')}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          conversionFormat === 'PDF' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
                        <FileText className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                      <button 
                        onClick={() => setConversionFormat('DOCX')}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          conversionFormat === 'DOCX' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
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
                      <span>Convert to {conversionFormat} ({uploadedFiles.length} files)</span>
                    )}
                  </button>

                  {/* Results */}
                  {processedFiles.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Conversion Complete
                      </h4>
                      <div className="space-y-3">
                        {processedFiles.map((file, index) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <FileText className="h-6 w-6 text-red-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'converter')}
                              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex-shrink-0"
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
                              <button
                                onClick={() => handleViewDocument(file)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View document"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(file)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <button 
                      onClick={() => setPdfOperation('combine_documents')}
                      className={`p-3 sm:p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'combine_documents' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Combine Documents</span>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Merge certificates, marksheets & ID images into PDF</p>
                    </button>
                    <button 
                      onClick={() => setPdfOperation('pdf_to_images')}
                      className={`p-3 sm:p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'pdf_to_images' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">PDF to Images</span>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Extract each page as separate image</p>
                    </button>
                    <button 
                      onClick={() => setPdfOperation('compress')}
                      className={`p-3 sm:p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'compress' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Compress PDF</span>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Reduce file size</p>
                    </button>
                    <button 
                      onClick={() => setPdfOperation('combine_pdfs')}
                      className={`p-3 sm:p-4 border rounded-xl text-center transition-colors ${
                        pdfOperation === 'combine_pdfs' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Combine PDFs</span>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Merge multiple PDF files into one</p>
                    </button>
                  </div>

                  {/* Operation Options */}

                  {pdfOperation === 'compress' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Compression Level</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  {pdfOperation === 'pdf_to_images' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Image Format</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['PNG', 'JPG'].map((format) => (
                          <button
                            key={format}
                            onClick={() => setOutputFormat(format as 'JPG' | 'PNG' | 'PDF')}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              outputFormat === format
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            <span className="text-sm font-medium">{format}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(pdfOperation === 'combine_documents' || pdfOperation === 'combine_pdfs') && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            {pdfOperation === 'combine_documents' ? 'Document Combination' : 'PDF Combination'}
                          </h4>
                          <p className="text-sm text-blue-800">
                            {pdfOperation === 'combine_documents' 
                              ? 'Upload certificates, marksheets, ID images (JPG, PNG, PDF) to combine into a single PDF document.'
                              : 'Upload multiple PDF files to combine them into a single PDF document.'}
                          </p>
                        </div>
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
                        <span>
                          {pdfOperation === 'combine_documents' && 'Combining documents...'}
                          {pdfOperation === 'pdf_to_images' && 'Converting to images...'}
                          {pdfOperation === 'combine_pdfs' && 'Combining PDFs...'}
                          {pdfOperation === 'compress' && 'Compressing PDF...'}
                          {pdfOperation === 'merge' && 'Merging PDFs...'}
                        </span>
                      </>
                    ) : (
                      <span>
                        {pdfOperation === 'combine_documents' && 'Combine Documents'}
                        {pdfOperation === 'pdf_to_images' && 'Convert to Images'}
                        {pdfOperation === 'combine_pdfs' && 'Combine PDFs'}
                        {pdfOperation === 'compress' && 'Compress PDF'}
                        {pdfOperation === 'merge' && 'Merge PDFs'}
                        {' '}({uploadedFiles.length} files)
                      </span>
                    )}
                  </button>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="text-green-900 font-medium">
                          {pdfOperation === 'combine_documents' && 'Combining your documents...'}
                          {pdfOperation === 'pdf_to_images' && 'Converting PDF to images...'}
                          {pdfOperation === 'combine_pdfs' && 'Combining your PDFs...'}
                          {pdfOperation === 'compress' && 'Compressing your PDF...'}
                          {pdfOperation === 'merge' && 'Merging your PDFs...'}
                        </span>
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
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <FileText className="h-6 w-6 text-green-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size / 1024).toFixed(1)} KB
                                  {file.files && file.files.length > 0 && ` • ${file.files.length} files`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'pdf-tools')}
                              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex-shrink-0"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


                  {signatureType === 'draw' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Draw Your Signature</h4>
                      <div className="bg-white border-2 border-purple-300 rounded-lg overflow-hidden shadow-sm">
                        <canvas
                          ref={(canvas) => {
                            if (canvas && canvas !== canvasRef) {
                              setCanvasRef(canvas);
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                // Set fixed canvas dimensions
                                canvas.width = 600;
                                canvas.height = 200;
                                
                                // Configure drawing context for smooth lines
                                ctx.fillStyle = 'white';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.strokeStyle = '#1f2937';
                                ctx.lineWidth = 3;
                                ctx.lineCap = 'round';
                                ctx.lineJoin = 'round';
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                              }
                            }
                          }}
                          className="w-full h-48 cursor-crosshair touch-none select-none"
                          style={{ 
                            width: '100%', 
                            height: '192px',
                            touchAction: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsDrawing(true);
                            const canvas = e.currentTarget;
                            const rect = canvas.getBoundingClientRect();
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                              ctx.beginPath();
                              ctx.moveTo(x, y);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (!isDrawing) return;
                            e.preventDefault();
                            const canvas = e.currentTarget;
                            const rect = canvas.getBoundingClientRect();
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                              ctx.lineTo(x, y);
                              ctx.stroke();
                            }
                          }}
                          onMouseUp={(e) => {
                            e.preventDefault();
                            setIsDrawing(false);
                            if (canvasRef) {
                              setSignatureData(canvasRef.toDataURL('image/png'));
                            }
                          }}
                          onMouseLeave={() => {
                            setIsDrawing(false);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            setIsDrawing(true);
                            const canvas = e.currentTarget;
                            const rect = canvas.getBoundingClientRect();
                            const touch = e.touches[0];
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                              const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                              ctx.beginPath();
                              ctx.moveTo(x, y);
                            }
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            if (!isDrawing) return;
                            const canvas = e.currentTarget;
                            const rect = canvas.getBoundingClientRect();
                            const touch = e.touches[0];
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                              const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                              ctx.lineTo(x, y);
                              ctx.stroke();
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            setIsDrawing(false);
                            if (canvasRef) {
                              setSignatureData(canvasRef.toDataURL('image/png'));
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              if (canvasRef) {
                                const ctx = canvasRef.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = 'white';
                                  ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
                                  setSignatureData('');
                                  setShowSignaturePreview(false);
                                }
                              }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors font-medium"
                          >
                            🗑️ Clear
                          </button>
                          <button 
                            onClick={() => {
                              if (signatureData) {
                                setShowSignaturePreview(!showSignaturePreview);
                              }
                            }}
                            disabled={!signatureData}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            👁️ {showSignaturePreview ? 'Hide Preview' : 'Preview'}
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Draw smoothly with mouse or finger</p>
                          <p className="text-xs text-purple-600 font-medium">✨ High-quality signature ready</p>
                        </div>
                      </div>
                      
                      {/* Signature Preview */}
                      {showSignaturePreview && signatureData && (
                        <div className="mt-4 p-4 bg-white border-2 border-purple-200 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3 text-center">Signature Preview</h5>
                          <div className="flex justify-center">
                            <img 
                              src={signatureData} 
                              alt="Signature Preview" 
                              className="max-w-full h-auto border border-gray-200 rounded shadow-sm bg-white"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-2">This is how your signature will appear in documents</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Create Button */}
                  <button 
                    onClick={processSignature}
                    disabled={isProcessing || (signatureType === 'text' && !signatureText.trim()) || (signatureType === 'draw' && !signatureData)}
                    className={`w-full py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                      isProcessing || (signatureType === 'text' && !signatureText.trim()) || (signatureType === 'draw' && !signatureData)
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
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <PenTool className="h-6 w-6 text-purple-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'signature')}
                              className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex-shrink-0"
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
                <div className="space-y-6" data-modal="document-scanner">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Scanner</h3>
                    <p className="text-gray-600">Scan physical documents using your camera or upload images</p>
                  </div>

                  {/* Scanner Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Camera Interface - Shows camera or button */}
                    {showCamera ? (
                      <div className="md:col-span-2 bg-gray-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-white">Camera Capture</h4>
                          <button
                            onClick={stopCamera}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="relative">
                          <video
                            id="camera-video"
                            autoPlay
                            playsInline
                            muted
                            ref={(video) => {
                              if (video && cameraStream) {
                                video.srcObject = cameraStream;
                                video.onloadedmetadata = () => {
                                  console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
                                  video.play().catch(e => console.log('Video play error:', e));
                                };
                                video.oncanplay = () => {
                                  console.log('Video can play');
                                };
                              }
                            }}
                            className="w-full rounded-lg"
                          />
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔴 Capture button clicked - starting capture process');
                                await capturePhoto();
                              }}
                              className="bg-orange-600 text-white p-4 rounded-full hover:bg-orange-700 transition-colors shadow-lg border-2 border-white"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <Camera className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={startCamera}
                        className="p-6 border-2 border-orange-300 rounded-xl hover:bg-orange-50 text-center transition-colors"
                      >
                        <Camera className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                        <span className="font-semibold text-gray-900 block mb-2">Use Camera</span>
                        <p className="text-sm text-gray-600">Scan documents using your device camera</p>
                      </button>
                    )}
                    
                    {/* Upload Images - Only show when camera is not active */}
                    {!showCamera && (
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
                    )}
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


                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && !showCamera && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-orange-900">Selected Images ({uploadedFiles.length})</h4>
                        <button
                          onClick={() => setUploadedFiles([])}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {uploadedFiles.map((file, index) => {
                          const imageUrl = URL.createObjectURL(file);
                          return (
                            <div key={index} className="relative bg-white rounded-lg p-2">
                              <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                <img 
                                  src={imageUrl}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  onLoad={() => {
                                    // Clean up the object URL after image loads
                                    setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
                                  }}
                                  onError={() => {
                                    console.error('Failed to load image preview for:', file.name);
                                    URL.revokeObjectURL(imageUrl);
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-700 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              <button
                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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

                  {/* Results */}
                  {processedFiles.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Scanning Complete
                      </h4>
                      <div className="space-y-3">
                        {processedFiles.map((file, index) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <FileText className="h-6 w-6 text-orange-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{file.processedName}</p>
                                <p className="text-sm text-gray-600">
                                  {file.format} • {(file.size).toFixed(1)} KB
                                  {file.pages && ` • ${file.pages} pages`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadFile(file.downloadUrl, file.processedName, 'scanner')}
                              className="w-full sm:w-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex-shrink-0"
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

      {/* Preview Modal */}
      {showPreviewModal && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewImage) {
                    URL.revokeObjectURL(previewImage);
                    setPreviewImage(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewImage}
                alt="Processed Image Preview"
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
            <div className="flex justify-center p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewImage) {
                    URL.revokeObjectURL(previewImage);
                    setPreviewImage(null);
                  }
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
