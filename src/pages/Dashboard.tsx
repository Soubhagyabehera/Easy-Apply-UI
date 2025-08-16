import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Building, Clock, Users, TrendingUp, ExternalLink, Calendar, Building2, FileText, UserPlus, LogIn, X, Eye, Download, CheckCircle, AlertCircle, GraduationCap, Briefcase, Filter, ChevronDown, ChevronUp, Zap, Shield, Sparkles, Camera } from 'lucide-react'
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
    qualification: ''
  })
  
  const [governmentJobs, setGovernmentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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
  
  const fetchGovernmentJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const jobs = await jobService.getGovernmentJobs({
        location: selectedFilters.location || undefined,
        department: selectedFilters.department || undefined,
        organization: selectedFilters.department || undefined
      })
      setGovernmentJobs(jobs)
    } catch (err) {
      setError('Failed to fetch government jobs. Please try again.')
      console.error('Error fetching government jobs:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Filter jobs based on search term, category, and status
  const filteredJobs = governmentJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      (selectedCategory === 'banking' && (job.organization?.toLowerCase().includes('bank') || job.organization?.toLowerCase().includes('sbi') || job.organization?.toLowerCase().includes('rbi'))) ||
      (selectedCategory === 'railway' && (job.organization?.toLowerCase().includes('railway') || job.organization?.toLowerCase().includes('metro'))) ||
      (selectedCategory === 'ssc' && (job.organization?.toLowerCase().includes('ssc') || job.organization?.toLowerCase().includes('staff selection'))) ||
      (selectedCategory === 'upsc' && (job.organization?.toLowerCase().includes('upsc') || job.organization?.toLowerCase().includes('civil'))) ||
      (selectedCategory === 'defense' && (job.organization?.toLowerCase().includes('army') || job.organization?.toLowerCase().includes('navy') || job.organization?.toLowerCase().includes('air force')))
    
    // Mock job status filtering (in real app, this would come from backend)
    const matchesStatus = jobStatus === 'all' || 
      (jobStatus === 'active' && (!job.status || job.status === 'active')) ||
      (jobStatus === 'admit-card' && job.status === 'admit-card') ||
      (jobStatus === 'results' && job.status === 'results')
    
    return matchesSearch && matchesCategory && matchesStatus
  })
  
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

  // Job status tabs
  const jobStatusTabs = [
    { id: 'active', name: 'Active Applications', count: governmentJobs.filter(job => !job.status || job.status === 'active').length },
    { id: 'admit-card', name: 'Admit Card Released', count: governmentJobs.filter(job => job.status === 'admit-card').length },
    { id: 'results', name: 'Results Declared', count: governmentJobs.filter(job => job.status === 'results').length },
    { id: 'all', name: 'All Jobs', count: governmentJobs.length }
  ]

  // Stats removed - not currently used in the UI

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl py-4 sm:py-6 md:py-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
              India's Only Complete Govt Job Platform
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-blue-100 mb-3 sm:mb-4 px-2">
              Find jobs <span className="font-semibold text-yellow-300">AND</span> prepare every document in minutes
            </p>
          </div>
          
          {/* Value Proposition Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-4xl mx-auto px-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 border border-white/20">
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="p-1 bg-green-500 rounded-md flex-shrink-0">
                  <Search className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-semibold text-xs truncate">Find All Jobs</h3>
              </div>
              <p className="text-xs text-blue-100 leading-tight">Clean, updated list with direct apply links</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 border border-white/20">
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="p-1 bg-purple-500 rounded-md flex-shrink-0">
                  <Camera className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-semibold text-xs truncate">Format Documents</h3>
              </div>
              <p className="text-xs text-blue-100 leading-tight">Edit, resize photos & docs to exact standards</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 border border-white/20">
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="p-1 bg-orange-500 rounded-md flex-shrink-0">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-semibold text-xs truncate">Secure Storage</h3>
              </div>
              <p className="text-xs text-blue-100 leading-tight">Access your documents anytime, anywhere</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 border border-white/20">
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="p-1 bg-red-500 rounded-md flex-shrink-0">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-semibold text-xs truncate">One-Click Format</h3>
              </div>
              <p className="text-xs text-blue-100 leading-tight">No more rejections for wrong size/format</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 px-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/documents"
                  className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Manage Documents</span>
                </Link>
                <Link
                  to="/auto-apply"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Auto-Apply (Coming Soon)</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Get Started Free</span>
                </Link>
                <Link
                  to="/signin"
                  className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Status Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto scrollbar-hide">
              {jobStatusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setJobStatus(tab.id as any)}
                  className={`flex-shrink-0 min-w-fit px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                    jobStatus === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <span className="whitespace-nowrap">{tab.name}</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                      jobStatus === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Search & Filters */}
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search government jobs..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Common Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <select 
                className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilters.location}
                onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
              >
                <option value="">📍 All Locations</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
                <option value="pan-india">Pan India</option>
              </select>
              
              <select 
                className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilters.department}
                onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
              >
                <option value="">🏢 All Organizations</option>
                {uniqueOrganizations.slice(0, 8).map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
              
              <select 
                className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilters.qualification}
                onChange={(e) => setSelectedFilters({...selectedFilters, qualification: e.target.value})}
              >
                <option value="">🎓 All Qualifications</option>
                <option value="graduate">Graduate</option>
                <option value="post-graduate">Post Graduate</option>
                <option value="12th">12th Pass</option>
                <option value="10th">10th Pass</option>
              </select>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Advanced Filters</span>
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              <button
                onClick={fetchGovernmentJobs}
                disabled={loading}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{loading ? 'Loading...' : 'Search Jobs'}</span>
              </button>
            </div>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <select 
                  className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFilters.jobType}
                  onChange={(e) => setSelectedFilters({...selectedFilters, jobType: e.target.value})}
                >
                  <option value="">🏛️ Job Type</option>
                  <option value="central">Central Government</option>
                  <option value="state">State Government</option>
                  <option value="psu">PSU</option>
                </select>
                
                <select 
                  className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFilters.salary}
                  onChange={(e) => setSelectedFilters({...selectedFilters, salary: e.target.value})}
                >
                  <option value="">💰 Salary Range</option>
                  <option value="0-25000">₹0 - ₹25,000</option>
                  <option value="25000-50000">₹25,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000+">₹1,00,000+</option>
                </select>
                
                <select 
                  className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFilters.experience}
                  onChange={(e) => setSelectedFilters({...selectedFilters, experience: e.target.value})}
                >
                  <option value="">💼 Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
                
                <select 
                  className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFilters.ageLimit}
                  onChange={(e) => setSelectedFilters({...selectedFilters, ageLimit: e.target.value})}
                >
                  <option value="">👤 Age Limit</option>
                  <option value="18-25">18-25 years</option>
                  <option value="18-30">18-30 years</option>
                  <option value="18-35">18-35 years</option>
                  <option value="no-limit">No Age Limit</option>
                </select>
              </div>
            )}
            
            {/* Popular Categories */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Popular Categories:</p>
              <div className="flex flex-wrap gap-2">
                {jobCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === category.id ? null : category.id)
                      setSearchTerm('')
                    }}
                    className={`inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      selectedCategory === category.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{category.icon}</span>
                    <span className="whitespace-nowrap">{category.name}</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>{category.jobCount}</span>
                  </button>
                ))}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <span>Clear</span>
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Available Jobs
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-blue-600">{filteredJobs.length}</span> jobs found
                {selectedCategory && <span className="ml-2 text-xs sm:text-sm">in {jobCategories.find(c => c.id === selectedCategory)?.name}</span>}
              </p>
            </div>
          </div>
        
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <div className="text-red-600">
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}
        
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Discovering government jobs using AI...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-full w-fit mx-auto mb-4 sm:mb-6">
                    <Building className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Try adjusting your filters or search terms to find more opportunities.</p>
                </div>
              ) : (
                filteredJobs.slice(0, 24).map((job) => (
                  <div key={job.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 overflow-hidden">
                    {/* Organization Header with Badge */}
                    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 text-white">
                      {/* Status Badge - Top Right */}
                      <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold z-10 ${
                        job.status === 'admit-card' 
                          ? 'bg-orange-100 text-orange-700' 
                          : job.status === 'results' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {job.status === 'admit-card' ? '🎫 Admit Card' : job.status === 'results' ? '📊 Results Out' : '🔥 Active'}
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 pr-20 sm:pr-24">
                        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-blue-100 truncate">
                            {job.organization || job.company}
                          </p>
                          <p className="text-xs text-blue-200">Government Job</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {/* Job Title */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      
                      {/* Key Information */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{job.location}</p>
                            <p className="text-xs text-gray-500">Location</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-red-600 truncate">
                              {job.apply_last_date || job.application_deadline || job.last_date || 'Check notification'}
                            </p>
                            <p className="text-xs text-gray-500">Application Deadline</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{job.vacancies || 'Multiple'}</p>
                              <p className="text-xs text-gray-500">Vacancies</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{job.fee ? `₹${job.fee}` : 'Free'}</p>
                              <p className="text-xs text-gray-500">Application Fee</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setShowJobDetails(true)
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">View Details</span>
                          <span className="xs:hidden">View</span>
                        </button>
                        <a
                          href={(() => {
                            const link = job.apply_link || job.apply_url || job.career_url || '#';
                            if (link === '#') return link;
                            return link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Apply Now</span>
                          <span className="xs:hidden">Apply</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Platform Benefits Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white rounded-2xl py-4 sm:py-5">
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              Stop Wasting Time on Formatting
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mb-3">
              Focus on preparing for your dream job, not fixing document sizes
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto px-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-1.5 rounded-md w-fit mx-auto mb-1">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-xs font-bold mb-0.5">Save Hours Daily</h3>
                  <p className="text-blue-100 text-xs leading-tight">
                    No more manual resizing. Our AI does it all in seconds.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-1.5 rounded-md w-fit mx-auto mb-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-xs font-bold mb-0.5">Perfect Applications</h3>
                  <p className="text-blue-100 text-xs leading-tight">
                    Documents meet exact portal requirements.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 p-1.5 rounded-md w-fit mx-auto mb-1">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-xs font-bold mb-0.5">Auto-Apply Coming</h3>
                  <p className="text-blue-100 text-xs leading-tight">
                    AI will fill applications automatically. Get ready now.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Your Entire Govt Job Application Kit — In Your Pocket</h3>
              <p className="text-blue-100 mb-4 text-sm">
                📌 No more hunting across portals, fixing file sizes, or rushing before deadlines.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {isAuthenticated ? (
                  <Link
                    to="/documents"
                    className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Start Using Document Tools</span>
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Start Applying Smarter Today</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
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
                        {selectedJob.eligibility_criteria?.education_qualification || 
                         'Graduate degree from recognized university or equivalent qualification as specified in the notification.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Age Limit</p>
                      <p className="text-green-700 text-sm">
                        {selectedJob.eligibility_criteria?.age_limit || 
                         '18-30 years (relaxation as per government norms for reserved categories)'}
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
