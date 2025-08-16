import { useState, useEffect } from 'react'
import { 
  FileText, Search, Calendar, CheckCircle, 
  Clock, XCircle, TrendingUp, RefreshCw, Plus, Edit3, Bell,
  BarChart3, Target, AlertTriangle, Award, Building2
} from 'lucide-react'
import { applicationService, Application, ApplicationCreate, ApplicationUpdate, ApplicationStats } from '../services/applicationService'
import { useAuth } from '../contexts/AuthContext'

// Custom CSS for date picker styling
const datePickerStyles = `
  /* Custom date picker styles to match theme */
  input[type="date"]::-webkit-calendar-picker-indicator {
    background-color: #3b82f6;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    background-color: #2563eb;
  }
  
  /* Chrome, Safari, Edge */
  input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }
  
  input[type="date"]::-webkit-datetime-edit-text {
    color: #6b7280;
    padding: 0 1px;
  }
  
  input[type="date"]::-webkit-datetime-edit-month-field,
  input[type="date"]::-webkit-datetime-edit-day-field,
  input[type="date"]::-webkit-datetime-edit-year-field {
    color: #374151;
  }
  
  input[type="date"]:focus::-webkit-datetime-edit-month-field,
  input[type="date"]:focus::-webkit-datetime-edit-day-field,
  input[type="date"]:focus::-webkit-datetime-edit-year-field {
    color: #1f2937;
    background-color: #dbeafe;
    border-radius: 2px;
  }
`

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total_applications: 0,
    applied_count: 0,
    document_verification_count: 0,
    exam_scheduled_count: 0,
    exam_completed_count: 0,
    interview_scheduled_count: 0,
    interview_completed_count: 0,
    result_pending_count: 0,
    selected_count: 0,
    rejected_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [newApplication, setNewApplication] = useState<ApplicationCreate>({
    job_title: '',
    company: '',
    department: '',
    applied_date: '',
    status: 'applied',
    application_id: '',
    exam_date: '',
    interview_date: '',
    application_fee: '',
    notes: ''
  })

  const [filters, setFilters] = useState({
    status: '',
    department: '',
    dateRange: '',
    search: ''
  })
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const statusConfig = {
    applied: { color: 'blue', icon: FileText, label: 'Applied' },
    document_verification: { color: 'purple', icon: FileText, label: 'Document Verification' },
    exam_scheduled: { color: 'yellow', icon: Calendar, label: 'Exam Scheduled' },
    exam_completed: { color: 'orange', icon: CheckCircle, label: 'Exam Completed' },
    interview_scheduled: { color: 'indigo', icon: Calendar, label: 'Interview Scheduled' },
    interview_completed: { color: 'cyan', icon: CheckCircle, label: 'Interview Completed' },
    result_pending: { color: 'amber', icon: Clock, label: 'Result Pending' },
    selected: { color: 'green', icon: TrendingUp, label: 'Selected' },
    rejected: { color: 'red', icon: XCircle, label: 'Rejected' }
  }

  // Create status tabs with counts
  const statusTabs = [
    { 
      status: 'all', 
      label: 'All Applications', 
      icon: FileText, 
      count: applications.length 
    },
    ...Object.entries(statusConfig).map(([status, config]) => ({
      status,
      label: config.label,
      icon: config.icon,
      count: applications.filter(app => app.status === status).length
    }))
  ]

  // Load applications and stats on component mount
  useEffect(() => {
    if (user) {
      loadApplications()
      loadStats()
    }
  }, [user])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await applicationService.getApplications(filters)
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await applicationService.getApplicationStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Reload when filters change
  useEffect(() => {
    if (user && !loading) {
      loadApplications()
    }
  }, [filters])

  const addApplication = async () => {
    try {
      // Clean up the application data before sending
      const applicationData: ApplicationCreate = {
        job_title: newApplication.job_title,
        company: newApplication.company,
        department: newApplication.department || undefined,
        applied_date: newApplication.applied_date,
        status: newApplication.status,
        application_id: newApplication.application_id || undefined,
        exam_date: newApplication.exam_date || undefined,
        interview_date: newApplication.interview_date || undefined,
        application_fee: newApplication.application_fee || undefined,
        notes: newApplication.notes || undefined
      }
      
      const createdApp = await applicationService.createApplication(applicationData)
      setApplications([...applications, createdApp])
      setNewApplication({
        job_title: '',
        company: '',
        department: '',
        applied_date: '',
        status: 'applied',
        application_id: '',
        exam_date: '',
        interview_date: '',
        application_fee: '',
        notes: ''
      })
      setShowAddModal(false)
      loadStats() // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application')
    }
  }

  const updateApplicationStatus = async (id: string, status: Application['status'], notes?: string) => {
    try {
      const updateData: ApplicationUpdate = { status }
      if (notes) updateData.notes = notes
      
      const updatedApp = await applicationService.updateApplication(id, updateData)
      setApplications(apps => apps.map(app => app.id === id ? updatedApp : app))
      loadStats() // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    const matchesDepartment = !filters.department || app.department === filters.department
    const matchesSearch = !filters.search || 
      app.job_title.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.company.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesDepartment && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject custom date picker styles */}
      <style>{datePickerStyles}</style>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Application Tracker</h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Track and manage your government job applications</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Application</span>
              <span className="xs:hidden">Add</span>
            </button>
            <button
              onClick={loadApplications}
              disabled={loading}
              className="bg-white/20 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
              <span className="xs:hidden">↻</span>
            </button>
          </div>
        </div>
      </div>

        {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Applications</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.total_applications}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Progress</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                  {stats.exam_scheduled_count + stats.interview_scheduled_count + stats.document_verification_count}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Selected</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.selected_count}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Needs Attention</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.rejected_count}</p>
              </div>
              <div className="bg-red-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filter by Status</h2>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto min-w-0"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {statusTabs.map((tab) => (
              <button
                key={tab.status}
                onClick={() => setSelectedStatus(tab.status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  selectedStatus === tab.status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                  selectedStatus === tab.status
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <div className="bg-gray-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">Start tracking your government job applications</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Add Your First Application</span>
                <span className="xs:hidden">Add Application</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((application) => {
                const statusInfo = statusConfig[application.status]
                const StatusIcon = statusInfo.icon
                
                return (
                  <div key={application.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="bg-blue-100 p-1.5 rounded-lg flex-shrink-0">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{application.job_title}</h3>
                            <p className="text-xs text-gray-600 truncate">{application.company}</p>
                          </div>
                        </div>
                        
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-${statusInfo.color}-100 mb-3`}>
                          <StatusIcon className={`h-3 w-3 text-${statusInfo.color}-600`} />
                          <span className={`text-xs font-medium text-${statusInfo.color}-700`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setEditingApp(application)}
                        className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>Applied: {application.applied_date}</span>
                        </div>
                        {application.application_fee && (
                          <span className="text-gray-900 font-medium">₹{application.application_fee}</span>
                        )}
                      </div>
                      
                      {application.exam_date && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>Exam: {application.exam_date}</span>
                        </div>
                      )}
                      
                      {application.department && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span>Dept: {application.department}</span>
                        </div>
                      )}
                    </div>

                    {application.notes && (
                      <div className="bg-gray-50 rounded-lg p-2 mb-3">
                        <p className="text-xs text-gray-700 line-clamp-2">{application.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>Updated: {new Date(application.last_updated).toLocaleDateString()}</span>
                      {application.reminder_date && (
                        <div className="flex items-center space-x-1">
                          <Bell className="h-3 w-3" />
                          <span>{application.reminder_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Application</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={newApplication.job_title}
                      onChange={(e) => setNewApplication({...newApplication, job_title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Company *</label>
                    <input
                      type="text"
                      value={newApplication.company}
                      onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., State Bank of India"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Department</label>
                    <select
                      value={newApplication.department}
                      onChange={(e) => setNewApplication({...newApplication, department: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    >
                      <option value="">Select Department</option>
                      <option value="Banking">Banking</option>
                      <option value="Railway">Railway</option>
                      <option value="SSC">SSC</option>
                      <option value="UPSC">UPSC</option>
                      <option value="Police">Police</option>
                      <option value="Defense">Defense</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Applied Date *</label>
                    <input
                      type="date"
                      value={newApplication.applied_date}
                      onChange={(e) => setNewApplication({...newApplication, applied_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Application ID</label>
                    <input
                      type="text"
                      value={newApplication.application_id}
                      onChange={(e) => setNewApplication({...newApplication, application_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., SBI2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Application Fee</label>
                    <input
                      type="text"
                      value={newApplication.application_fee}
                      onChange={(e) => setNewApplication({...newApplication, application_fee: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., ₹750"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Notes</label>
                  <textarea
                    value={newApplication.notes}
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows={3}
                    placeholder="Any additional notes about this application..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addApplication}
                  disabled={!newApplication.job_title || !newApplication.company || !newApplication.applied_date}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  Add Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update Status</h2>
                <button
                  onClick={() => setEditingApp(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded-lg font-medium">{editingApp.job_title} at {editingApp.company}</p>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({...editingApp, status: e.target.value as Application['status']})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="applied">Applied</option>
                    <option value="document_verification">Document Verification</option>
                    <option value="exam_scheduled">Exam Scheduled</option>
                    <option value="exam_completed">Exam Completed</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interview_completed">Interview Completed</option>
                    <option value="result_pending">Result Pending</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Notes</label>
                  <textarea
                    value={editingApp.notes || ''}
                    onChange={(e) => setEditingApp({...editingApp, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows={3}
                    placeholder="Update notes about this application..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingApp(null)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateApplicationStatus(editingApp.id, editingApp.status, editingApp.notes)
                    setEditingApp(null)
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
