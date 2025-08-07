import { useState } from 'react'
import { 
  FileText, Filter, Search, Calendar, CheckCircle, 
  Clock, XCircle, Eye, Download, ExternalLink, 
  AlertCircle, TrendingUp, RefreshCw 
} from 'lucide-react'

interface Application {
  id: number
  jobTitle: string
  company: string
  department: string
  appliedDate: string
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'selected'
  applicationId: string
  examDate?: string
  interviewDate?: string
  resultDate?: string
  applicationFee: string
  documents: string[]
  nextAction?: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      jobTitle: 'Probationary Officer',
      company: 'State Bank of India',
      department: 'SBI',
      appliedDate: '2024-01-15',
      status: 'under_review',
      applicationId: 'SBI2024001',
      examDate: '2024-03-15',
      applicationFee: '₹750',
      documents: ['Graduation Certificate', 'Photo', 'Signature'],
      nextAction: 'Admit card download starts on 2024-03-01'
    },
    {
      id: 2,
      jobTitle: 'Assistant Loco Pilot',
      company: 'Indian Railways',
      department: 'Railway',
      appliedDate: '2024-01-20',
      status: 'shortlisted',
      applicationId: 'IR2024002',
      examDate: '2024-02-28',
      interviewDate: '2024-04-15',
      applicationFee: '₹500',
      documents: ['ITI Certificate', 'Photo', 'Signature'],
      nextAction: 'Prepare for interview'
    },
    {
      id: 3,
      jobTitle: 'Combined Graduate Level',
      company: 'Staff Selection Commission',
      department: 'SSC',
      appliedDate: '2024-01-10',
      status: 'submitted',
      applicationId: 'SSC2024003',
      examDate: '2024-04-20',
      applicationFee: '₹600',
      documents: ['Graduation Certificate', 'Caste Certificate', 'Photo'],
      nextAction: 'Wait for admit card'
    },
    {
      id: 4,
      jobTitle: 'Clerk',
      company: 'Institute of Banking Personnel Selection',
      department: 'IBPS',
      appliedDate: '2024-01-05',
      status: 'rejected',
      applicationId: 'IBPS2024004',
      examDate: '2024-02-10',
      resultDate: '2024-02-25',
      applicationFee: '₹600',
      documents: ['Graduation Certificate', 'Photo', 'Signature']
    },
    {
      id: 5,
      jobTitle: 'Sub Inspector',
      company: 'Delhi Police',
      department: 'Police',
      appliedDate: '2023-12-20',
      status: 'selected',
      applicationId: 'DP2023005',
      examDate: '2024-01-15',
      interviewDate: '2024-02-05',
      resultDate: '2024-02-20',
      applicationFee: '₹400',
      documents: ['Graduation Certificate', 'Physical Standards', 'Photo'],
      nextAction: 'Document verification on 2024-03-01'
    }
  ])

  const [filters, setFilters] = useState({
    status: '',
    department: '',
    dateRange: '',
    search: ''
  })

  const statusConfig = {
    submitted: { color: 'blue', icon: FileText, label: 'Submitted' },
    under_review: { color: 'yellow', icon: Clock, label: 'Under Review' },
    shortlisted: { color: 'green', icon: CheckCircle, label: 'Shortlisted' },
    rejected: { color: 'red', icon: XCircle, label: 'Rejected' },
    selected: { color: 'emerald', icon: TrendingUp, label: 'Selected' }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !filters.status || app.status === filters.status
    const matchesDepartment = !filters.department || app.department === filters.department
    const matchesSearch = !filters.search || 
      app.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.company.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesDepartment && matchesSearch
  })

  const stats = {
    total: applications.length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    selected: applications.filter(app => app.status === 'selected').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">My Applications</h1>
              <p className="text-green-100 text-lg">
                Track and manage all your job applications in one place
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-green-100">Total Applications</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.under_review}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.selected}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter Applications</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Clear All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
          >
            <option value="">All Departments</option>
            <option value="SBI">SBI</option>
            <option value="Railway">Railway</option>
            <option value="SSC">SSC</option>
            <option value="IBPS">IBPS</option>
            <option value="Police">Police</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
          >
            <option value="">All Time</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No applications found matching your criteria.</p>
          </div>
        ) : (
          filteredApplications.map((application) => {
            const statusInfo = statusConfig[application.status]
            const StatusIcon = statusInfo.icon
            
            return (
              <div key={application.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{application.jobTitle}</h3>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-${statusInfo.color}-100`}>
                        <StatusIcon className={`h-4 w-4 text-${statusInfo.color}-600`} />
                        <span className={`text-sm font-medium text-${statusInfo.color}-700`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">{application.company}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Applied: {application.appliedDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>ID: {application.applicationId}</span>
                      </div>
                      {application.examDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Exam: {application.examDate}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Fee: {application.applicationFee}</span>
                      </div>
                    </div>

                    {application.nextAction && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Next Action Required</p>
                            <p className="text-sm text-blue-700">{application.nextAction}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Documents: </span>
                        <span className="text-gray-600">{application.documents.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                      <span>Track Status</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Timeline for selected applications */}
                {application.status === 'selected' && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Application Timeline</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Applied: {application.appliedDate}</span>
                      </div>
                      {application.examDate && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Exam: {application.examDate}</span>
                        </div>
                      )}
                      {application.interviewDate && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Interview: {application.interviewDate}</span>
                        </div>
                      )}
                      {application.resultDate && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Result: {application.resultDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
