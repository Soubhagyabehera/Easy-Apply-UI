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

  const updateApplicationStatus = async (id: string, status: Application['status'], notes?: string, dateFields?: {
    exam_date?: string;
    interview_date?: string;
    document_verification_date?: string;
    result_date?: string;
  }) => {
    try {
      const updateData: ApplicationUpdate = { status }
      if (notes) updateData.notes = notes
      
      // Add date fields if provided, converting empty strings to undefined
      if (dateFields) {
        updateData.exam_date = dateFields.exam_date || undefined
        updateData.interview_date = dateFields.interview_date || undefined
        updateData.document_verification_date = dateFields.document_verification_date || undefined
        updateData.result_date = dateFields.result_date || undefined
      }
      
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
      
      {/* Container for consistent width */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6 lg:mb-8">
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
        <div>
        
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

        {/* Important Dates Calendar */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Calendar Header */}
            <div className="lg:w-1/3">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Important Dates</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Upcoming exams & interviews</p>
                </div>
              </div>
              
              {/* Current Month Display */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-purple-600 font-medium">
                    {(() => {
                      const today = new Date();
                      let monthEvents = 0;
                      
                      applications.forEach(app => {
                        const checkDate = (dateStr) => {
                          if (!dateStr) return false;
                          const date = new Date(dateStr);
                          return date >= today && date.getMonth() === today.getMonth();
                        };
                        
                        if (checkDate(app.exam_date) || 
                            checkDate(app.interview_date) || 
                            checkDate(app.document_verification_date) || 
                            checkDate(app.result_date)) {
                          monthEvents++;
                        }
                      });
                      
                      return monthEvents;
                    })()} events this month
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Events List */}
            <div className="lg:w-2/3">
              <div className="space-y-3">
                {(() => {
                  const upcomingEvents = [];
                  const today = new Date();
                  
                  applications.forEach(app => {
                    // Exam dates
                    if (app.exam_date) {
                      const examDate = new Date(app.exam_date);
                      if (examDate >= today) {
                        upcomingEvents.push({
                          date: examDate,
                          type: 'exam',
                          title: `${app.job_title} - Exam`,
                          company: app.company,
                          icon: 'exam',
                          color: 'blue'
                        });
                      }
                    }
                    
                    // Interview dates
                    if (app.interview_date) {
                      const interviewDate = new Date(app.interview_date);
                      if (interviewDate >= today) {
                        upcomingEvents.push({
                          date: interviewDate,
                          type: 'interview',
                          title: `${app.job_title} - Interview`,
                          company: app.company,
                          icon: 'interview',
                          color: 'green'
                        });
                      }
                    }
                    
                    // Document verification dates
                    if (app.document_verification_date) {
                      const docDate = new Date(app.document_verification_date);
                      if (docDate >= today) {
                        upcomingEvents.push({
                          date: docDate,
                          type: 'document',
                          title: `${app.job_title} - Document Verification`,
                          company: app.company,
                          icon: 'document',
                          color: 'purple'
                        });
                      }
                    }
                    
                    // Result dates
                    if (app.result_date) {
                      const resultDate = new Date(app.result_date);
                      if (resultDate >= today) {
                        upcomingEvents.push({
                          date: resultDate,
                          type: 'result',
                          title: `${app.job_title} - Result`,
                          company: app.company,
                          icon: 'result',
                          color: 'orange'
                        });
                      }
                    }
                  });
                  
                  // Sort by date
                  upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
                  
                  if (upcomingEvents.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                          <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">No upcoming events</p>
                        <p className="text-xs text-gray-500 mt-1">Add exam or interview dates to your applications</p>
                      </div>
                    );
                  }
                  
                  return upcomingEvents.slice(0, 4).map((event, index) => {
                    const isToday = event.date.toDateString() === today.toDateString();
                    const isTomorrow = event.date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
                    const daysUntil = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    const getEventStyles = (color) => {
                      switch (color) {
                        case 'blue':
                          return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
                        case 'green':
                          return 'bg-green-50 border-green-200 hover:bg-green-100';
                        case 'purple':
                          return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
                        case 'orange':
                          return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
                        default:
                          return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
                      }
                    };
                    
                    const getIconBgColor = (color) => {
                      switch (color) {
                        case 'blue': return 'bg-blue-500';
                        case 'green': return 'bg-green-500';
                        case 'purple': return 'bg-purple-500';
                        case 'orange': return 'bg-orange-500';
                        default: return 'bg-gray-500';
                      }
                    };
                    
                    const getEventIcon = (type) => {
                      switch (type) {
                        case 'exam':
                          return <FileText className="h-4 w-4 text-white" />;
                        case 'interview':
                          return <Clock className="h-4 w-4 text-white" />;
                        case 'document':
                          return <CheckCircle className="h-4 w-4 text-white" />;
                        case 'result':
                          return <TrendingUp className="h-4 w-4 text-white" />;
                        default:
                          return <Calendar className="h-4 w-4 text-white" />;
                      }
                    };
                    
                    return (
                      <div key={index} className={`flex items-center space-x-4 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${getEventStyles(event.color)}`}>
                        <div className={`p-2 rounded-lg ${getIconBgColor(event.color)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{event.company}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900">
                            {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className={`text-xs font-medium ${
                            isToday ? 'text-red-600' : 
                            isTomorrow ? 'text-orange-600' : 
                            daysUntil <= 7 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {isToday ? 'Today' : 
                             isTomorrow ? 'Tomorrow' : 
                             daysUntil <= 7 ? `${daysUntil} days` : 
                             event.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
                
                {/* Show More Button */}
                {(() => {
                  const today = new Date();
                  let totalEvents = 0;
                  
                  applications.forEach(app => {
                    const checkUpcomingDate = (dateStr) => {
                      if (!dateStr) return false;
                      const date = new Date(dateStr);
                      return date >= today;
                    };
                    
                    if (checkUpcomingDate(app.exam_date) || 
                        checkUpcomingDate(app.interview_date) || 
                        checkUpcomingDate(app.document_verification_date) || 
                        checkUpcomingDate(app.result_date)) {
                      totalEvents++;
                    }
                  });
                  
                  if (totalEvents > 4) {
                    return (
                      <div className="text-center pt-2">
                        <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                          View all {totalEvents} upcoming events →
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
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
                      {/* Applied Date and Fee */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>Applied: {application.applied_date}</span>
                        </div>
                        {application.application_fee && (
                          <span className="text-gray-900 font-medium">₹{application.application_fee}</span>
                        )}
                      </div>
                      
                      {/* Last Status Event Date */}
                      {(() => {
                        const getLastStatusEventDate = (app) => {
                          const dates = [];
                          
                          if (app.exam_date) dates.push({ date: app.exam_date, label: 'Exam', icon: FileText });
                          if (app.interview_date) dates.push({ date: app.interview_date, label: 'Interview', icon: Clock });
                          if (app.document_verification_date) dates.push({ date: app.document_verification_date, label: 'Doc Verification', icon: CheckCircle });
                          if (app.result_date) dates.push({ date: app.result_date, label: 'Result', icon: TrendingUp });
                          
                          if (dates.length === 0) return null;
                          
                          // Sort by date and get the most recent
                          dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          return dates[0];
                        };
                        
                        const lastEvent = getLastStatusEventDate(application);
                        
                        if (lastEvent) {
                          const EventIcon = lastEvent.icon;
                          const eventDate = new Date(lastEvent.date);
                          const today = new Date();
                          const isPast = eventDate < today;
                          const isToday = eventDate.toDateString() === today.toDateString();
                          const isFuture = eventDate > today;
                          
                          return (
                            <div className="flex items-center space-x-1 text-xs">
                              <EventIcon className={`h-3 w-3 ${
                                isToday ? 'text-red-500' : 
                                isFuture ? 'text-blue-500' : 
                                'text-gray-500'
                              }`} />
                              <span className={`${
                                isToday ? 'text-red-600 font-medium' : 
                                isFuture ? 'text-blue-600' : 
                                'text-gray-600'
                              }`}>
                                {lastEvent.label}: {lastEvent.date}
                                {isToday && ' (Today)'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Department */}
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

      {/* Add Application Modal - Redesigned */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Add New Application</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Track your government job application</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-xl"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Progress indicator */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2">
                  <span>Complete all required fields</span>
                  <span>{[newApplication.job_title, newApplication.company, newApplication.applied_date].filter(Boolean).length}/3 required</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${([newApplication.job_title, newApplication.company, newApplication.applied_date].filter(Boolean).length / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Form sections */}
              <div className="space-y-6 sm:space-y-8">
                {/* Essential Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-blue-500 p-1.5 rounded-lg">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Essential Information</h3>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">Required</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>Job Title *</span>
                      </label>
                      <input
                        type="text"
                        value={newApplication.job_title}
                        onChange={(e) => setNewApplication({...newApplication, job_title: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="e.g., Software Engineer, Bank PO, SSC CGL"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>Organization *</span>
                      </label>
                      <input
                        type="text"
                        value={newApplication.company}
                        onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="e.g., State Bank of India, Indian Railways"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Applied Date *</span>
                      </label>
                      <input
                        type="date"
                        value={newApplication.applied_date}
                        onChange={(e) => setNewApplication({...newApplication, applied_date: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>Department</span>
                      </label>
                      <select
                        value={newApplication.department}
                        onChange={(e) => setNewApplication({...newApplication, department: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="">Select Department</option>
                        <option value="Banking">🏦 Banking</option>
                        <option value="Railway">🚂 Railway</option>
                        <option value="SSC">📋 SSC</option>
                        <option value="UPSC">🏛️ UPSC</option>
                        <option value="Police">👮 Police</option>
                        <option value="Defense">⚔️ Defense</option>
                        <option value="Teaching">👨‍🏫 Teaching</option>
                        <option value="Other">📁 Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-green-500 p-1.5 rounded-lg">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Additional Details</h3>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">Optional</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span>Application ID</span>
                      </label>
                      <input
                        type="text"
                        value={newApplication.application_id}
                        onChange={(e) => setNewApplication({...newApplication, application_id: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                        placeholder="e.g., SBI2024001, RRB2024-456"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <span className="text-green-500">₹</span>
                        <span>Application Fee</span>
                      </label>
                      <input
                        type="text"
                        value={newApplication.application_fee}
                        onChange={(e) => setNewApplication({...newApplication, application_fee: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                        placeholder="e.g., ₹750, ₹100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Edit3 className="h-4 w-4 text-green-500" />
                      <span>Notes</span>
                    </label>
                    <textarea
                      value={newApplication.notes}
                      onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white resize-none"
                      rows={3}
                      placeholder="Any additional notes, exam dates, interview schedules, or important reminders..."
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>All data is stored securely</span>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addApplication}
                    disabled={!newApplication.job_title || !newApplication.company || !newApplication.applied_date}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Application</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal - Redesigned */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Update Status</h2>
                    <p className="text-indigo-100 text-xs sm:text-sm">Track your application progress</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingApp(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-xl"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Application Info Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-indigo-100 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-indigo-500 p-2 rounded-xl">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{editingApp.job_title}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{editingApp.company}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Applied: {editingApp.applied_date}</span>
                  </div>
                </div>
                
                {editingApp.department && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span>Department: {editingApp.department}</span>
                  </div>
                )}
              </div>

                {/* Status Update Section */}
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-blue-500 p-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Application Status</h3>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">Update Progress</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span>Current Status</span>
                      </label>
                      <select
                        value={editingApp.status}
                        onChange={(e) => setEditingApp({...editingApp, status: e.target.value as Application['status']})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="applied">📝 Applied</option>
                        <option value="document_verification">📋 Document Verification</option>
                        <option value="exam_scheduled">📅 Exam Scheduled</option>
                        <option value="exam_completed">✅ Exam Completed</option>
                        <option value="interview_scheduled">🗓️ Interview Scheduled</option>
                        <option value="interview_completed">✅ Interview Completed</option>
                        <option value="result_pending">⏳ Result Pending</option>
                        <option value="selected">🎉 Selected</option>
                        <option value="rejected">❌ Rejected</option>
                      </select>
                    </div>

                    {/* Conditional Date Fields */}
                    {(editingApp.status === 'exam_scheduled' || editingApp.status === 'exam_completed') && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Exam Date</span>
                        </label>
                        <input
                          type="date"
                          value={editingApp.exam_date || ''}
                          onChange={(e) => setEditingApp({...editingApp, exam_date: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                    )}

                    {(editingApp.status === 'interview_scheduled' || editingApp.status === 'interview_completed') && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Interview Date</span>
                        </label>
                        <input
                          type="date"
                          value={editingApp.interview_date || ''}
                          onChange={(e) => setEditingApp({...editingApp, interview_date: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                    )}

                    {editingApp.status === 'document_verification' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Document Verification Date</span>
                        </label>
                        <input
                          type="date"
                          value={editingApp.document_verification_date || ''}
                          onChange={(e) => setEditingApp({...editingApp, document_verification_date: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                    )}

                    {editingApp.status === 'result_pending' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Expected Result Date</span>
                        </label>
                        <input
                          type="date"
                          value={editingApp.result_date || ''}
                          onChange={(e) => setEditingApp({...editingApp, result_date: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                    )}

                    {(editingApp.status === 'selected' || editingApp.status === 'rejected') && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Result Announcement Date</span>
                        </label>
                        <input
                          type="date"
                          value={editingApp.result_date || ''}
                          onChange={(e) => setEditingApp({...editingApp, result_date: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-green-500 p-1.5 rounded-lg">
                      <Edit3 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Additional Notes</h3>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">Optional</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>Update Notes</span>
                    </label>
                    <textarea
                      value={editingApp.notes || ''}
                      onChange={(e) => setEditingApp({...editingApp, notes: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white resize-none"
                      rows={4}
                      placeholder="Add any updates, exam results, interview feedback, or important reminders..."
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date(editingApp.last_updated).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setEditingApp(null)}
                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateApplicationStatus(editingApp.id, editingApp.status, editingApp.notes, {
                        exam_date: editingApp.exam_date,
                        interview_date: editingApp.interview_date,
                        document_verification_date: editingApp.document_verification_date,
                        result_date: editingApp.result_date
                      })
                      setEditingApp(null)
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Update Status</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
