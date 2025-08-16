import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  Users, 
  Eye, 
  ExternalLink, 
  Filter,
  ChevronDown,
  X,
  AlertCircle,
  Briefcase,
  FileText,
  Shield,
  Zap,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { jobService } from '../services/jobService'

interface Job {
  id: string
  title: string
  organization?: string
  company?: string
  location: string
  job_type?: string
  category?: string
  apply_last_date?: string
  application_deadline?: string
  last_date?: string
  apply_link?: string
  apply_url?: string
  career_url?: string
  vacancies?: string | number
  posted_date?: string
  fee?: number
  job_description?: string
  required_documents?: string[]
}

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth()
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    department: '',
    jobType: '',
    experience: ''
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
  
  // Filter jobs based on search term and category
  const filteredJobs = governmentJobs.filter(job => {
    const orgName = (job.organization || job.company || '').toLowerCase()
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orgName.includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      (selectedCategory === 'banking' && (orgName.includes('bank') || orgName.includes('sbi') || orgName.includes('rbi'))) ||
      (selectedCategory === 'railway' && (orgName.includes('railway') || orgName.includes('metro'))) ||
      (selectedCategory === 'ssc' && (orgName.includes('ssc') || orgName.includes('staff selection'))) ||
      (selectedCategory === 'upsc' && (orgName.includes('upsc') || orgName.includes('civil'))) ||
      (selectedCategory === 'defense' && (orgName.includes('army') || orgName.includes('navy') || orgName.includes('air force')))
    
    return matchesSearch && matchesCategory
  })
  
  // Get unique organizations for filter options (handle both organization and company fields)
  const uniqueOrganizations = [...new Set(governmentJobs.map(job => job.organization || job.company).filter(Boolean))]

  // Compact job categories
  const jobCategories: JobCategory[] = [
    {
      id: 'banking',
      name: 'Banking',
      description: 'SBI, IBPS, RBI',
      icon: '🏦',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('bank') || orgName.includes('sbi') || orgName.includes('rbi')
      }).length,
      departments: ['SBI', 'IBPS', 'RBI']
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Indian Railways',
      icon: '🚂',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('railway') || orgName.includes('metro')
      }).length,
      departments: ['Railways', 'Metro']
    },
    {
      id: 'ssc',
      name: 'SSC',
      description: 'Staff Selection',
      icon: '📋',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('ssc') || orgName.includes('staff selection')
      }).length,
      departments: ['SSC CGL', 'SSC CHSL']
    },
    {
      id: 'upsc',
      name: 'UPSC',
      description: 'Civil Services',
      icon: '🏛️',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('upsc') || orgName.includes('civil')
      }).length,
      departments: ['IAS', 'IPS']
    },
    {
      id: 'defense',
      name: 'Defense',
      description: 'Armed Forces',
      icon: '🛡️',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('army') || orgName.includes('navy') || orgName.includes('air force')
      }).length,
      departments: ['Army', 'Navy', 'Air Force']
    },
    {
      id: 'teaching',
      name: 'Education',
      description: 'Teaching Jobs',
      icon: '📚',
      jobCount: filteredJobs.filter(job => {
        const orgName = (job.organization || job.company || '').toLowerCase()
        return orgName.includes('education') || orgName.includes('university')
      }).length,
      departments: ['Universities', 'Schools']
    }
  ]

  // Stats removed - not currently used in the UI

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              India's Only Complete Govt Job Platform
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-6">
              Find jobs AND prepare every document in minutes
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <span>All govt jobs in one place</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <span>Auto-format documents</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <span>Direct apply links</span>
              </div>
            </div>
          </div>
          
          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Find All Jobs</h3>
              <p className="text-sm text-blue-100">Clean, updated list with direct apply links</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Format Documents</h3>
              <p className="text-sm text-blue-100">Resize photos, signatures to exact standards</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Secure Storage</h3>
              <p className="text-sm text-blue-100">Access documents anytime, anywhere</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">One-Click Apply</h3>
              <p className="text-sm text-blue-100">No more rejections for wrong formats</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/documents"
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Format Documents</span>
                </Link>
                <Link
                  to="/auto-apply"
                  className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Star className="h-5 w-5" />
                  <span>Auto Apply (Coming Soon)</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Start Free Today</span>
                </Link>
                <Link
                  to="/signin"
                  className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

        {/* Job Status Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Browse Jobs by Status</h2>
            <div className="text-sm text-gray-600">
              Don't miss out on any opportunity
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setJobStatus('active')}
              className={`p-4 rounded-xl border-2 transition-all ${
                jobStatus === 'active' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${jobStatus === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Active Applications</div>
                  <div className="text-sm text-gray-600">Apply now</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setJobStatus('admit-card')}
              className={`p-4 rounded-xl border-2 transition-all ${
                jobStatus === 'admit-card' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${jobStatus === 'admit-card' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Admit Cards</div>
                  <div className="text-sm text-gray-600">Download now</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setJobStatus('results')}
              className={`p-4 rounded-xl border-2 transition-all ${
                jobStatus === 'results' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${jobStatus === 'results' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Results Out</div>
                  <div className="text-sm text-gray-600">Check status</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setJobStatus('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                jobStatus === 'all' 
                  ? 'border-gray-500 bg-gray-50 text-gray-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${jobStatus === 'all' ? 'bg-gray-100' : 'bg-gray-100'}`}>
                  <Building className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">All Jobs</div>
                  <div className="text-sm text-gray-600">Complete list</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, organization, location, or keywords..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Quick Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Popular Filters:</span>
              {jobCategories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                    setSearchTerm('')
                  }}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-blue-400 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>{category.jobCount}</span>
                </button>
              ))}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
              >
                <span>Advanced Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <span>Clear: {jobCategories.find(c => c.id === selectedCategory)?.name}</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    value={selectedFilters.location}
                    onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
                  >
                    <option value="">All Locations</option>
                    <option value="delhi">Delhi NCR</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="pune">Pune</option>
                    <option value="pan-india">Pan India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    value={selectedFilters.department}
                    onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
                  >
                    <option value="">All Organizations</option>
                    {uniqueOrganizations.slice(0, 15).map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    value={selectedFilters.jobType}
                    onChange={(e) => setSelectedFilters({...selectedFilters, jobType: e.target.value})}
                  >
                    <option value="">All Job Types</option>
                    <option value="central">Central Government</option>
                    <option value="state">State Government</option>
                    <option value="psu">PSU</option>
                    <option value="banking">Banking</option>
                    <option value="railway">Railway</option>
                    <option value="defense">Defense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    value={selectedFilters.experience}
                    onChange={(e) => setSelectedFilters({...selectedFilters, experience: e.target.value})}
                  >
                    <option value="">All Experience Levels</option>
                    <option value="fresher">Fresher (0-1 years)</option>
                    <option value="experienced">Experienced (2-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors">
                    <option value="">Any Fee</option>
                    <option value="free">Free Application</option>
                    <option value="paid">Paid Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors">
                    <option value="">Any Deadline</option>
                    <option value="today">Ending Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="extended">Extended Deadline</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {jobStatus === 'active' && 'Active Job Applications'}
                {jobStatus === 'admit-card' && 'Admit Cards Available'}
                {jobStatus === 'results' && 'Results Declared'}
                {jobStatus === 'all' && 'All Government Jobs'}
              </h2>
              <p className="text-gray-600">{filteredJobs.length} opportunities • Updated daily</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="text-sm text-gray-500">
                📌 No more hunting across portals
              </div>
              <button
                onClick={fetchGovernmentJobs}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Error loading jobs</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Finding the best opportunities</h3>
              <p className="text-gray-600">Scanning all government portals for you...</p>
            </div>
          ) : (
            <>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms to find more opportunities.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchTerm('')
                      setSelectedFilters({location: '', department: '', jobType: '', experience: ''})
                    }}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Job Stats */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
                        <div className="text-sm text-gray-600">Total Jobs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {filteredJobs.filter(job => {
                            const deadline = job.apply_last_date || job.application_deadline || job.last_date
                            return deadline && new Date(deadline) > new Date()
                          }).length}
                        </div>
                        <div className="text-sm text-gray-600">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {filteredJobs.filter(job => job.job_type === 'central' || job.organization?.toLowerCase().includes('central')).length}
                        </div>
                        <div className="text-sm text-gray-600">Central Govt</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {filteredJobs.filter(job => !job.fee || job.fee === 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Free Apply</div>
                      </div>
                    </div>
                  </div>

                  {/* Jobs Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.slice(0, 24).map((job) => (
                      <div key={job.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
                        <div className="space-y-4">
                          {/* Job Status Badge */}
                          <div className="flex items-center justify-between">
                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                              jobStatus === 'active' ? 'bg-green-100 text-green-700' :
                              jobStatus === 'admit-card' ? 'bg-blue-100 text-blue-700' :
                              jobStatus === 'results' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {jobStatus === 'active' && '🟢 Apply Now'}
                              {jobStatus === 'admit-card' && '📄 Admit Card'}
                              {jobStatus === 'results' && '📊 Results'}
                              {jobStatus === 'all' && (job.job_type || 'Government')}
                            </span>
                            <div className="text-xs text-gray-500">
                              {job.posted_date || 'Recently posted'}
                            </div>
                          </div>

                          {/* Job Header */}
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-gray-700 font-medium truncate">
                                {job.organization || job.company}
                              </span>
                            </div>
                          </div>
                          
                          {/* Job Details */}
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-green-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-gray-700 font-medium truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-red-50 rounded-lg">
                                <Clock className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="text-red-600 font-semibold truncate">
                                {job.apply_last_date || job.application_deadline || job.last_date || 'Check notification'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-gray-50 rounded-lg">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-gray-700 truncate">
                                {job.vacancies ? `${job.vacancies} positions` : 'Multiple positions'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-3 pt-4">
                            <button
                              onClick={() => {
                                setSelectedJob(job)
                                setShowJobDetails(true)
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Details</span>
                            </button>
                            <a
                              href={(() => {
                                const link = job.apply_link || job.apply_url || job.career_url || '#';
                                if (link === '#') return link;
                                return link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Apply</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredJobs.length > 24 && (
                    <div className="text-center pt-8">
                      <button className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                        Load More Jobs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stop wasting time on formatting</h3>
          <p className="text-lg mb-6 text-white/90">
            Your entire govt job application kit — in your pocket. Start focusing on preparing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/documents"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Format Documents Now</span>
            </Link>
            <Link
              to="/auto-apply"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 border border-white/20"
            >
              <Star className="h-5 w-5" />
              <span>Auto-Apply Coming Soon</span>
            </Link>
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
