import { useState } from 'react'
import { 
  Folder, Upload, Download, Eye, Trash2, 
  CheckCircle, AlertCircle, Plus, FileText, 
  Image, File, Calendar, Shield, User 
} from 'lucide-react'

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Folder className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Document Manager</h1>
              <p className="text-indigo-100 text-lg">
                Upload, manage and verify your documents for job applications
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

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

      {/* Upload Modal */}
      {uploadModalOpen && (
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
    </div>
  )
}
