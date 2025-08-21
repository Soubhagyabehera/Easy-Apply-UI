import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Building, Clock, Users, TrendingUp, ExternalLink, Calendar, Building2, FileText, X, Eye, Download, CheckCircle, AlertCircle, GraduationCap, Briefcase, ChevronDown, ChevronUp, Zap, Shield, Camera } from 'lucide-react'
import { jobService } from '../services/jobService'
import { Job, JobCategory } from '../types/job'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    department: '',
    jobType: '',
    experience: '',
    salary: '',
    ageLimit: '',
    qualification: '',
    applicationStatus: '',
    applicationMode: '',
    examDate: ''
  })
  const [sortBy, setSortBy] = useState<'deadline' | 'vacancy' | 'recent' | 'default'>('default')
  
  const [governmentJobs, setGovernmentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<Job[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [jobStatus, setJobStatus] = useState<'active' | 'admit-card' | 'results' | 'all'>('active')
  
  // Fetch government jobs on component mount
  useEffect(() => {
    fetchGovernmentJobs()
  }, [])
  
  // Fetch jobs when filters change
  useEffect(() => {
    if (!loading) {
      fetchGovernmentJobs()
    }
  }, [selectedFilters.location, selectedFilters.department])

  // Handle search suggestions
  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      const filtered = governmentJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions
      setSearchSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, governmentJobs])

  const handleSuggestionClick = (job: Job) => {
    if (job.apply_link) {
      window.open(job.apply_link, '_blank')
    }
    setShowSuggestions(false)
    setSearchTerm('')
  }
  
  const fetchGovernmentJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const jobs = await jobService.getGovernmentJobs({
        // Main filters
        location: selectedFilters.location || undefined,
        qualification: selectedFilters.qualification || undefined,
        job_type: selectedFilters.jobType || undefined,
        employment_type: selectedFilters.experience || undefined,
        // Advanced filters
        department: selectedFilters.department || undefined,
        salary: selectedFilters.salary || undefined,
        age_limit: selectedFilters.ageLimit || undefined,
        application_status: selectedFilters.applicationStatus || undefined,
        application_mode: selectedFilters.applicationMode || undefined,
        exam_date: selectedFilters.examDate || undefined
      })
      setGovernmentJobs(jobs)
    } catch (err) {
      setError('Failed to fetch government jobs. Please try again.')
      console.error('Error fetching government jobs:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Helper function to check if job deadline has passed
  const isJobExpired = (job: Job) => {
    const deadline = job.application_deadline || job.last_date
    if (!deadline) return false
    
    try {
      const deadlineDate = new Date(deadline)
      const today = new Date()
      
      // Set deadline to end of the deadline day (23:59:59)
      deadlineDate.setHours(23, 59, 59, 999)
      
      // Set today to start of today (00:00:00) for proper comparison
      today.setHours(0, 0, 0, 0)
      
      // Job is expired if deadline has passed (deadline < today)
      return deadlineDate.getTime() < today.getTime()
    } catch {
      return false
    }
  }

  // Filter and sort jobs based on search term, category, status, and sort option
  const filteredAndSortedJobs = (() => {
    // First filter jobs
    const filtered = governmentJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || 
        (selectedCategory === 'banking' && (job.organization?.toLowerCase().includes('bank') || job.organization?.toLowerCase().includes('sbi') || job.organization?.toLowerCase().includes('rbi'))) ||
        (selectedCategory === 'railway' && (job.organization?.toLowerCase().includes('railway') || job.organization?.toLowerCase().includes('metro'))) ||
        (selectedCategory === 'ssc' && (job.organization?.toLowerCase().includes('ssc') || job.organization?.toLowerCase().includes('staff selection'))) ||
        (selectedCategory === 'upsc' && (job.organization?.toLowerCase().includes('upsc') || job.organization?.toLowerCase().includes('civil'))) ||
        (selectedCategory === 'defense' && (job.organization?.toLowerCase().includes('army') || job.organization?.toLowerCase().includes('navy') || job.organization?.toLowerCase().includes('air force')))
      
      // Enhanced job status filtering with deadline check
      const matchesStatus = jobStatus === 'all' || 
        (jobStatus === 'active' && (!job.status || job.status === 'active') && !isJobExpired(job)) ||
        (jobStatus === 'admit-card' && job.status === 'admit-card') ||
        (jobStatus === 'results' && job.status === 'results')
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    // Then sort the filtered jobs
    if (sortBy === 'default') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          // Sort by application deadline (earliest first)
          const dateA = new Date(a.application_deadline || a.last_date || '9999-12-31')
          const dateB = new Date(b.application_deadline || b.last_date || '9999-12-31')
          return dateA.getTime() - dateB.getTime()
        
        case 'vacancy':
          // Sort by number of vacancies (highest first)
          const vacancyA = parseInt(a.vacancies?.toString().replace(/\D/g, '') || '0') || 0
          const vacancyB = parseInt(b.vacancies?.toString().replace(/\D/g, '') || '0') || 0
          return vacancyB - vacancyA
        
        case 'recent':
          // Sort by posted date (most recent first)
          const postedA = new Date(a.posted_date || a.created_at || '1970-01-01')
          const postedB = new Date(b.posted_date || b.created_at || '1970-01-01')
          return postedB.getTime() - postedA.getTime()
        
        default:
          return 0
      }
    })
  })()
  
  // Get unique organizations for filter options
  const uniqueOrganizations = [...new Set(governmentJobs.map(job => job.organization).filter(Boolean))]

  // Enhanced job categories with better organization
  const jobCategories: JobCategory[] = [
    {
      id: 'banking',
      name: 'Banking',
      description: 'SBI, IBPS, RBI',
      icon: '🏦',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('bank') || job.organization?.toLowerCase().includes('sbi') || job.organization?.toLowerCase().includes('rbi')).length,
      departments: ['SBI', 'IBPS', 'RBI']
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Indian Railways',
      icon: '🚂',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('railway') || job.organization?.toLowerCase().includes('metro')).length,
      departments: ['Railways', 'Metro']
    },
    {
      id: 'ssc',
      name: 'SSC',
      description: 'Staff Selection',
      icon: '📋',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('ssc') || job.organization?.toLowerCase().includes('staff selection')).length,
      departments: ['SSC CGL', 'SSC CHSL']
    },
    {
      id: 'upsc',
      name: 'UPSC',
      description: 'Civil Services',
      icon: '🏛️',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('upsc') || job.organization?.toLowerCase().includes('civil')).length,
      departments: ['IAS', 'IPS']
    },
    {
      id: 'defense',
      name: 'Defense',
      description: 'Armed Forces',
      icon: '🛡️',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('army') || job.organization?.toLowerCase().includes('navy') || job.organization?.toLowerCase().includes('air force')).length,
      departments: ['Army', 'Navy', 'Air Force']
    },
    {
      id: 'teaching',
      name: 'Education',
      description: 'Teaching Jobs',
      icon: '📚',
      jobCount: governmentJobs.filter(job => job.organization?.toLowerCase().includes('education') || job.organization?.toLowerCase().includes('university')).length,
      departments: ['Universities', 'Schools']
    }
  ]

  // Job status tabs with responsive names - calculate from all jobs, not filtered
  const jobStatusTabs = [
    { 
      id: 'active', 
      name: 'Active Jobs', 
      shortName: 'Active',
      count: governmentJobs.filter(job => !job.status || job.status === 'active').length 
    },
    { 
      id: 'admit-card', 
      name: 'Admit Card Released', 
      shortName: 'Admit Card',
      count: governmentJobs.filter(job => job.status === 'admit-card').length 
    },
    { 
      id: 'results', 
      name: 'Results Declared', 
      shortName: 'Results',
      count: governmentJobs.filter(job => job.status === 'results').length 
    },
    { 
      id: 'all', 
      name: 'All Jobs', 
      shortName: 'All',
      count: governmentJobs.length 
    }
  ]

  // Stats removed - not currently used in the UI

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 border-b border-blue-100 dark:border-gray-600 transition-colors">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Search Bar */}
          <div className="mb-3 sm:mb-4">
            <div className="relative max-w-3xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Govt Jobs by Title or Org..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim().length > 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2 text-sm border-2 border-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white shadow-md hover:shadow-lg transition-all"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((job, index) => (
                    <div
                      key={`${job.title}-${index}`}
                      onClick={() => handleSuggestionClick(job)}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{job.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{job.organization || job.company}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{job.location}</span>
                            {(job.application_deadline || job.last_date) && (
                              <>
                                <span>•</span>
                                <span>Apply by: {new Date(job.application_deadline || job.last_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compact Mobile-First Action Buttons */}
          <div className="w-full">
            {/* Mobile: Ultra-Compact Stacked Layout */}
            <div className="block sm:hidden">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/60 dark:border-gray-600/60">
                {/* Primary Find Jobs Button */}
                <button 
                  onClick={() => {
                    const jobsSection = document.getElementById('jobs-section');
                    if (jobsSection) {
                      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full mb-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm active:scale-98 transition-transform"
                >
                  <Search className="h-4 w-4" />
                  <span>Find Jobs</span>
                </button>
                
                {/* Secondary Action Row */}
                <div className="grid grid-cols-3 gap-1">
                  <Link 
                    to={isAuthenticated ? "/documents?tab=tools" : "/documents?tab=tools"}
                    className="rounded-lg px-1.5 py-1.5 flex flex-col items-center space-y-0.5 transition-colors active:scale-95"
                    style={{backgroundColor: '#16A34A'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                  >
                    <Camera className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">Tools</span>
                  </Link>
                  
                  <Link 
                    to={isAuthenticated ? '/documents?tab=manager' : '/signin'}
                    className="rounded-lg px-1.5 py-1.5 flex flex-col items-center space-y-0.5 transition-colors active:scale-95"
                    style={{backgroundColor: '#9333EA'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333EA'}
                  >
                    <Shield className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">Storage</span>
                  </Link>
                  
                  <Link 
                    to={isAuthenticated ? '/auto-apply' : '/signin'}
                    className="bg-orange-500 hover:bg-orange-600 rounded-lg px-1.5 py-1.5 flex flex-col items-center space-y-0.5 transition-colors active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">Auto Apply</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop: Traditional Layout */}
            <div className="hidden sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  const jobsSection = document.getElementById('jobs-section');
                  if (jobsSection) {
                    jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Find Government Jobs</span>
              </button>
              <Link 
                to={isAuthenticated ? "/documents?tab=tools" : "/documents?tab=tools"}
                className="px-4 py-3 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                style={{backgroundColor: '#16A34A'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
              >
                <Camera className="h-4 w-4" />
                <span>Smart Document Tools</span>
              </Link>
              <Link 
                to={isAuthenticated ? '/documents?tab=manager' : '/signin'}
                className="px-4 py-3 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                style={{backgroundColor: '#9333EA'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333EA'}
              >
                <Shield className="h-4 w-4" />
                <span>Secure Document Storage</span>
              </Link>
              <Link 
                to={isAuthenticated ? '/auto-apply' : '/signin'}
                className="px-4 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>One-Click Auto Apply</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-2 lg:px-3 py-2 sm:py-4">

        {/* Search and Filters */}
        <div className="mb-4">
          {/* Ultra-Compact Mobile Layout */}
          <div className="block sm:hidden">
            {/* Mobile: Compact Status Tabs */}
            <div className="flex gap-1 mb-2 px-1">
              {jobStatusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setJobStatus(tab.id as any)}
                  className={`flex-1 px-1.5 py-1 rounded-md text-xs font-medium transition-all text-center ${
                    jobStatus === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-bold ${jobStatus === tab.id ? 'text-white' : 'text-blue-600'}`}>
                      {tab.count}
                    </span>
                    <span className="text-xs opacity-90">
                      {tab.shortName.split(' ')[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Mobile: Categories + Sort + Filter Button */}
            <div className="space-y-2 mb-2">
              {/* Categories + Sort + Filter Button Row */}
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 pb-1">
                    {jobCategories.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category.id ? null : category.id)
                          setSearchTerm('')
                        }}
                        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          selectedCategory === category.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-xs">{category.icon}</span>
                        <span>{category.name}</span>
                        <span className={`text-xs px-1 py-0.5 rounded-full ${
                          selectedCategory === category.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                        }`}>{category.jobCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort By Dropdown - Mobile */}
                <select 
                  className="flex-shrink-0 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 min-w-[80px]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'deadline' | 'vacancy' | 'recent' | 'default')}
                >
                  <option value="default">Sort</option>
                  <option value="deadline">Deadline</option>
                  <option value="vacancy">Vacancy</option>
                  <option value="recent">Recent</option>
                </select>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex-shrink-0 px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <span>Filter</span>
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            {/* Header with Job Count and Status Tabs in One Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                <span className="text-blue-600">{filteredAndSortedJobs.length}</span> Govt Jobs Available
              </h2>
              
              {/* Compact Status Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {jobStatusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setJobStatus(tab.id as any)}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      jobStatus === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="hidden xs:inline sm:hidden md:inline">{tab.shortName}</span>
                    <span className="xs:hidden sm:inline md:hidden">{tab.shortName.split(' ')[0]}</span>
                    <span className="ml-1 text-xs font-medium opacity-75">({tab.count})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Compact Main Filters */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2 sm:p-3 mb-3 shadow-sm">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 items-center">
                <select 
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  value={selectedFilters.location}
                  onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
                >
                  <option value="">Location</option>
                    <option value="all-india">All India</option>
                    <optgroup label="States">
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="arunachal-pradesh">Arunachal Pradesh</option>
                      <option value="assam">Assam</option>
                      <option value="bihar">Bihar</option>
                      <option value="chhattisgarh">Chhattisgarh</option>
                      <option value="goa">Goa</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="haryana">Haryana</option>
                      <option value="himachal-pradesh">Himachal Pradesh</option>
                      <option value="jharkhand">Jharkhand</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="kerala">Kerala</option>
                      <option value="madhya-pradesh">Madhya Pradesh</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="manipur">Manipur</option>
                      <option value="meghalaya">Meghalaya</option>
                      <option value="mizoram">Mizoram</option>
                      <option value="nagaland">Nagaland</option>
                      <option value="odisha">Odisha</option>
                      <option value="punjab">Punjab</option>
                      <option value="rajasthan">Rajasthan</option>
                      <option value="sikkim">Sikkim</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      <option value="telangana">Telangana</option>
                      <option value="tripura">Tripura</option>
                      <option value="uttar-pradesh">Uttar Pradesh</option>
                      <option value="uttarakhand">Uttarakhand</option>
                      <option value="west-bengal">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="andaman-nicobar">Andaman & Nicobar Islands</option>
                      <option value="chandigarh">Chandigarh</option>
                      <option value="dadra-nagar-haveli">Dadra & Nagar Haveli and Daman & Diu</option>
                      <option value="delhi">Delhi</option>
                      <option value="jammu-kashmir">Jammu & Kashmir</option>
                      <option value="ladakh">Ladakh</option>
                      <option value="lakshadweep">Lakshadweep</option>
                      <option value="puducherry">Puducherry</option>
                    </optgroup>
                </select>
                
                <select 
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  value={selectedFilters.qualification}
                  onChange={(e) => setSelectedFilters({...selectedFilters, qualification: e.target.value})}
                >
                  <option value="">Qualification</option>
                  <option value="10th">10th Pass</option>
                  <option value="12th">12th Pass</option>
                  <option value="graduate">Graduate</option>
                  <option value="post-graduate">Post Graduate</option>
                  <option value="diploma">Diploma</option>
                  <option value="iti">ITI</option>
                </select>
                
                <select 
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  value={selectedFilters.jobType}
                  onChange={(e) => setSelectedFilters({...selectedFilters, jobType: e.target.value})}
                >
                  <option value="">Job Type</option>
                  <option value="central">Central Govt</option>
                  <option value="state">State Govt</option>
                  <option value="psu">PSU</option>
                  <option value="autonomous">Autonomous</option>
                </select>
                
                <select 
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  value={selectedFilters.experience}
                  onChange={(e) => setSelectedFilters({...selectedFilters, experience: e.target.value})}
                >
                  <option value="">Employment</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
                
                {/* Sort By Dropdown */}
                <select 
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'deadline' | 'vacancy' | 'recent' | 'default')}
                >
                  <option value="default">Sort By</option>
                  <option value="deadline">Deadline</option>
                  <option value="vacancy">Vacancy</option>
                  <option value="recent">Recently Posted</option>
                </select>
                
                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 rounded text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>More</span>
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                
                <button
                  onClick={fetchGovernmentJobs}
                  disabled={loading}
                  className="w-full px-2 sm:px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1 col-span-1 xs:col-span-2 sm:col-span-3 lg:col-span-1"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-3 w-3" />
                  )}
                  <span className="hidden xs:inline">{loading ? 'Searching...' : 'Search'}</span>
                  <Search className="h-3 w-3 xs:hidden" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          <div className="mb-3">
            {Object.values(selectedFilters).some(filter => filter !== '') && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                <span className="text-xs font-medium text-gray-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Active Filters:</span>
                  <span className="sm:hidden">Filters:</span>
                </span>
                {selectedFilters.location && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span className="hidden xs:inline">📍 </span>
                    {selectedFilters.location === 'all-india' ? 'All India' : selectedFilters.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, location: ''})}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </span>
                )}
                {selectedFilters.qualification && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="hidden xs:inline">🎓 </span>
                    {selectedFilters.qualification}
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, qualification: ''})}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </span>
                )}
                {selectedFilters.jobType && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <span className="hidden xs:inline">💼 </span>
                    {selectedFilters.jobType === 'central' ? 'Central' : selectedFilters.jobType === 'state' ? 'State' : selectedFilters.jobType === 'psu' ? 'PSU' : 'Autonomous'}
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, jobType: ''})}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </span>
                )}
                {selectedFilters.experience && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <span className="hidden xs:inline">🏛️ </span>
                    {selectedFilters.experience}
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, experience: ''})}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </span>
                )}
                {(selectedFilters.department || selectedFilters.salary || selectedFilters.ageLimit || selectedFilters.applicationStatus || selectedFilters.applicationMode || selectedFilters.examDate) && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="hidden xs:inline">⚙️ </span>
                    <span className="hidden sm:inline">Advanced filters</span>
                    <span className="sm:hidden">More</span>
                  </span>
                )}
                <button
                  onClick={() => setSelectedFilters({
                    location: '',
                    department: '',
                    jobType: '',
                    experience: '',
                    salary: '',
                    ageLimit: '',
                    qualification: '',
                    applicationStatus: '',
                    applicationMode: '',
                    examDate: ''
                  })}
                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Advanced Filters - Mobile Modal Style */}
          {showAdvancedFilters && (
            <div className="block sm:hidden">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3 mb-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.location}
                    onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
                  >
                    <option value="">Location</option>
                    <option value="all-india">All India</option>
                    <optgroup label="States">
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="arunachal-pradesh">Arunachal Pradesh</option>
                      <option value="assam">Assam</option>
                      <option value="bihar">Bihar</option>
                      <option value="chhattisgarh">Chhattisgarh</option>
                      <option value="goa">Goa</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="haryana">Haryana</option>
                      <option value="himachal-pradesh">Himachal Pradesh</option>
                      <option value="jharkhand">Jharkhand</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="kerala">Kerala</option>
                      <option value="madhya-pradesh">Madhya Pradesh</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="manipur">Manipur</option>
                      <option value="meghalaya">Meghalaya</option>
                      <option value="mizoram">Mizoram</option>
                      <option value="nagaland">Nagaland</option>
                      <option value="odisha">Odisha</option>
                      <option value="punjab">Punjab</option>
                      <option value="rajasthan">Rajasthan</option>
                      <option value="sikkim">Sikkim</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      <option value="telangana">Telangana</option>
                      <option value="tripura">Tripura</option>
                      <option value="uttar-pradesh">Uttar Pradesh</option>
                      <option value="uttarakhand">Uttarakhand</option>
                      <option value="west-bengal">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="andaman-nicobar">Andaman & Nicobar Islands</option>
                      <option value="chandigarh">Chandigarh</option>
                      <option value="dadra-nagar-haveli">Dadra & Nagar Haveli and Daman & Diu</option>
                      <option value="delhi">Delhi</option>
                      <option value="jammu-kashmir">Jammu & Kashmir</option>
                      <option value="ladakh">Ladakh</option>
                      <option value="lakshadweep">Lakshadweep</option>
                      <option value="puducherry">Puducherry</option>
                    </optgroup>
                  </select>
                  
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.qualification}
                    onChange={(e) => setSelectedFilters({...selectedFilters, qualification: e.target.value})}
                  >
                    <option value="">Qualification</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="graduate">Graduate</option>
                    <option value="post-graduate">Post Graduate</option>
                  </select>
                  
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.jobType}
                    onChange={(e) => setSelectedFilters({...selectedFilters, jobType: e.target.value})}
                  >
                    <option value="">Job Type</option>
                    <option value="central">Central</option>
                    <option value="state">State</option>
                    <option value="psu">PSU</option>
                  </select>
                  
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.experience}
                    onChange={(e) => setSelectedFilters({...selectedFilters, experience: e.target.value})}
                  >
                    <option value="">Employment</option>
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                  </select>
                  
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.salary}
                    onChange={(e) => setSelectedFilters({...selectedFilters, salary: e.target.value})}
                  >
                    <option value="">Salary</option>
                    <option value="0-25000">₹0-25K</option>
                    <option value="25000-50000">₹25K-50K</option>
                    <option value="50000-100000">₹50K-1L</option>
                    <option value="100000+">₹1L+</option>
                  </select>
                  
                  <select 
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedFilters.ageLimit}
                    onChange={(e) => setSelectedFilters({...selectedFilters, ageLimit: e.target.value})}
                  >
                    <option value="">Age Limit</option>
                    <option value="18-25">18-25</option>
                    <option value="18-30">18-30</option>
                    <option value="18-35">18-35</option>
                    <option value="21-35">21-35</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={fetchGovernmentJobs}
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                    <span>Search</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedFilters({
                      location: '',
                      department: '',
                      jobType: '',
                      experience: '',
                      salary: '',
                      ageLimit: '',
                      qualification: '',
                      applicationStatus: '',
                      applicationMode: '',
                      examDate: ''
                    })}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Advanced Filters */}
          <div className="hidden sm:block">
            {showAdvancedFilters && (
              <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2 sm:p-3 mb-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <select 
                    className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    value={selectedFilters.department}
                    onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
                  >
                    <option value="">Organization</option>
                    {uniqueOrganizations.slice(0, 8).map(org => org && (
                      <option key={org} value={org}>{org.length > 20 ? org.substring(0, 20) + '...' : org}</option>
                    ))}
                  </select>
                  
                  <select 
                    className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    value={selectedFilters.salary}
                    onChange={(e) => setSelectedFilters({...selectedFilters, salary: e.target.value})}
                  >
                    <option value="">Salary Range</option>
                    <option value="0-25000">₹0 - ₹25K</option>
                    <option value="25000-50000">₹25K - ₹50K</option>
                    <option value="50000-100000">₹50K - ₹1L</option>
                    <option value="100000+">₹1L+</option>
                  </select>
                  
                  <select 
                    className="w-full px-2 sm:px-2.5 py-2 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700/50 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    value={selectedFilters.ageLimit}
                    onChange={(e) => setSelectedFilters({...selectedFilters, ageLimit: e.target.value})}
                  >
                    <option value="">Age Limit</option>
                    <option value="18-25">18-25 years</option>
                    <option value="18-30">18-30 years</option>
                    <option value="18-35">18-35 years</option>
                    <option value="21-35">21-35 years</option>
                    <option value="no-limit">No Limit</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Categories - Desktop Only */}
          <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2">
            {jobCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  setSearchTerm('')
                }}
                className={`inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xs">{category.icon}</span>
                <span className="hidden xs:inline sm:inline">{category.name}</span>
                <span className="xs:hidden sm:hidden">{category.name.substring(0, 3)}</span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                }`}>{category.jobCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        <div id="jobs-section">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filteredAndSortedJobs.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                filteredAndSortedJobs.slice(0, 24).map((job) => (
                  <div key={job.id} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group">
                    {/* Compact Header with Title & Organization */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-0.5">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {job.organization || job.company}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          {sortBy === 'recent' && job.posted_date ? 'New' : 'Permanent'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Horizontal Info Bar */}
                    <div className="flex items-center justify-between text-xs mb-1.5 p-1.5">
                      {/* Deadline Section */}
                      <div className={`flex items-center space-x-1 flex-1 ${(() => {
                        const deadline = job.application_deadline || job.last_date
                        if (deadline) {
                          try {
                            const deadlineDate = new Date(deadline)
                            const today = new Date()
                            const diffTime = deadlineDate.getTime() - today.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            
                            if (diffDays < 0) {
                              return 'text-gray-500' // Expired
                            } else if (diffDays < 7) {
                              return 'text-red-500' // <7 days - Red (closing soon)
                            } else if (diffDays <= 30) {
                              return 'text-orange-500' // 7-30 days - Orange (moderate urgency)
                            } else {
                              return 'text-green-600' // >30 days - Green (plenty of time)
                            }
                          } catch {
                            return 'text-gray-500'
                          }
                        }
                        return 'text-gray-500'
                      })()}`}>
                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate text-xs">
                            {(() => {
                              const deadline = job.application_deadline || job.last_date
                              if (deadline) {
                                try {
                                  return new Date(deadline).toLocaleDateString('en-IN', { 
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                } catch {
                                  return 'Invalid Date'
                                }
                              }
                              return 'No deadline'
                            })()}
                          </div>
                          <div className={`text-xs font-medium ${(() => {
                            const deadline = job.application_deadline || job.last_date
                            if (deadline) {
                              try {
                                const deadlineDate = new Date(deadline)
                                const today = new Date()
                                const diffTime = deadlineDate.getTime() - today.getTime()
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                
                                if (diffDays < 0) {
                                  return 'text-gray-500' // Expired
                                } else if (diffDays < 7) {
                                  return 'text-red-500' // <7 days - Red (closing soon)
                                } else if (diffDays <= 30) {
                                  return 'text-orange-500' // 7-30 days - Orange (moderate urgency)
                                } else {
                                  return 'text-green-600' // >30 days - Green (plenty of time)
                                }
                              } catch {
                                return 'text-gray-500'
                              }
                            }
                            return 'text-gray-500'
                          })()}`}>
                            {(() => {
                              const deadline = job.application_deadline || job.last_date
                              if (deadline) {
                                try {
                                  const deadlineDate = new Date(deadline)
                                  const today = new Date()
                                  const diffTime = deadlineDate.getTime() - today.getTime()
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                  
                                  if (diffDays < 0) {
                                    return 'Expired'
                                  } else if (diffDays === 0) {
                                    return 'Today'
                                  } else if (diffDays === 1) {
                                    return '1 day left'
                                  } else {
                                    return `${diffDays} days left`
                                  }
                                } catch {
                                  return ''
                                }
                              }
                              return ''
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-6 bg-gray-300 mx-1.5"></div>
                      
                      {/* Vacancies & Fee */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <div className="flex items-center space-x-0.5">
                          <Users className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
                          <span className="font-medium text-xs text-gray-600 dark:text-gray-300">{job.vacancies || 'Multiple'}</span>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <TrendingUp className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
                          <span className="font-medium text-xs text-gray-600 dark:text-gray-300">{job.fee ? `₹${job.fee}` : 'Free'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Compact Action Buttons */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedJob(job)
                          setShowJobDetails(true)
                        }}
                        className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 group-hover:border-gray-300 dark:group-hover:border-gray-500"
                      >
                        <Eye className="h-2.5 w-2.5" />
                        <span>View</span>
                      </button>
                      <a
                        href={(() => {
                          const link = job.apply_link || job.apply_url || job.career_url || '#';
                          if (link === '#') return link;
                          return link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span>Apply</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 leading-tight">{selectedJob.title}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 md:h-5 md:w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium text-sm md:text-base">{selectedJob.organization || selectedJob.company}</span>
                    </div>
                    <span className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-700 text-xs md:text-sm rounded-full font-medium">
                      {selectedJob.job_type || 'Government'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Job Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{selectedJob.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Application Deadline</p>
                      <p className="font-medium text-red-600 text-sm md:text-base">{selectedJob.last_date || 'Check notification'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Posted Date</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{selectedJob.posted_date || 'Recently'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Vacancies</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{selectedJob.vacancies || 'Multiple'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">As per notification</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Application Fee</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        {selectedJob.fee ? `₹${selectedJob.fee}` : selectedJob.applicationFee || 'As per category'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedJob.job_description || selectedJob.description || 'This is a government job opportunity with competitive benefits, job security, and excellent career growth prospects. The position offers a chance to serve the nation while building a rewarding career in the public sector.'}
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Eligibility Criteria</span>
                </h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Educational Qualification</p>
                      <p className="text-green-700 text-sm">
                        {selectedJob.eligibility_criteria?.education_qualification 
                          ? (Array.isArray(selectedJob.eligibility_criteria.education_qualification)
                              ? selectedJob.eligibility_criteria.education_qualification.join(', ')
                              : selectedJob.eligibility_criteria.education_qualification)
                          : 'Graduate degree from recognized university or equivalent qualification as specified in the notification.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Age Limit</p>
                      <p className="text-green-700 text-sm">
                        {selectedJob.eligibility_criteria?.age_limit 
                          ? (selectedJob.eligibility_criteria.age_limit.min && selectedJob.eligibility_criteria.age_limit.max
                              ? `${selectedJob.eligibility_criteria.age_limit.min} - ${selectedJob.eligibility_criteria.age_limit.max} years`
                              : '18-30 years (relaxation as per government norms for reserved categories)')
                          : '18-30 years (relaxation as per government norms for reserved categories)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Other Requirements</p>
                      <p className="text-green-700 text-sm">
                        {selectedJob.eligibility_criteria?.other_requirement || 
                         'Indian citizenship, physical fitness, and other criteria as mentioned in the official notification.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Required Documents</span>
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedJob.required_documents && selectedJob.required_documents.length > 0 
                      ? selectedJob.required_documents 
                      : [
                          'Educational Certificates & Mark Sheets',
                          'Caste Certificate (if applicable)',
                          'Age Proof (Birth Certificate/10th Certificate)',
                          'Experience Certificates (if required)',
                          'Passport Size Photographs',
                          'Signature Specimen',
                          'Identity Proof (Aadhar/PAN/Passport)',
                          'Income Certificate (if applicable)'
                        ]
                    ).map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900 text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Download className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-900 font-medium text-sm">Document Format</p>
                        <p className="text-blue-700 text-xs">All documents should be in PDF format, clearly scanned, and within the specified size limits.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                <div className="text-xs md:text-sm text-gray-500">
                  Make sure to read the official notification for complete details
                </div>
                <div className="flex space-x-2 md:space-x-3">
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Close
                  </button>
                  {selectedJob.apply_url && (
                    <a
                      href={selectedJob.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium text-sm"
                    >
                      <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Apply Now</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
