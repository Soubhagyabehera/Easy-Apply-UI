import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Building, Clock, Users, TrendingUp, ExternalLink, Calendar, Building2, FileText, Star, UserPlus, LogIn, X, Eye, Download, CheckCircle, AlertCircle, GraduationCap, Briefcase } from 'lucide-react'
import { jobService } from '../services/jobService'
import { Job, JobCategory } from '../types/job'
import { useAuth } from '../contexts/AuthContext'

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
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      (selectedCategory === 'banking' && (job.organization?.toLowerCase().includes('bank') || job.organization?.toLowerCase().includes('sbi') || job.organization?.toLowerCase().includes('rbi'))) ||
      (selectedCategory === 'railway' && (job.organization?.toLowerCase().includes('railway') || job.organization?.toLowerCase().includes('metro'))) ||
      (selectedCategory === 'ssc' && (job.organization?.toLowerCase().includes('ssc') || job.organization?.toLowerCase().includes('staff selection'))) ||
      (selectedCategory === 'upsc' && (job.organization?.toLowerCase().includes('upsc') || job.organization?.toLowerCase().includes('civil'))) ||
      (selectedCategory === 'defense' && (job.organization?.toLowerCase().includes('army') || job.organization?.toLowerCase().includes('navy') || job.organization?.toLowerCase().includes('air force')))
    
    return matchesSearch && matchesCategory
  })
  
  // Get unique organizations for filter options
  const uniqueOrganizations = [...new Set(governmentJobs.map(job => job.organization).filter(Boolean))]

  // Compact job categories
  const jobCategories: JobCategory[] = [
    {
      id: 'banking',
      name: 'Banking',
      description: 'SBI, IBPS, RBI',
      icon: '🏦',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('bank') || job.organization?.toLowerCase().includes('sbi') || job.organization?.toLowerCase().includes('rbi')).length,
      departments: ['SBI', 'IBPS', 'RBI']
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Indian Railways',
      icon: '🚂',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('railway') || job.organization?.toLowerCase().includes('metro')).length,
      departments: ['Railways', 'Metro']
    },
    {
      id: 'ssc',
      name: 'SSC',
      description: 'Staff Selection',
      icon: '📋',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('ssc') || job.organization?.toLowerCase().includes('staff selection')).length,
      departments: ['SSC CGL', 'SSC CHSL']
    },
    {
      id: 'upsc',
      name: 'UPSC',
      description: 'Civil Services',
      icon: '🏛️',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('upsc') || job.organization?.toLowerCase().includes('civil')).length,
      departments: ['IAS', 'IPS']
    },
    {
      id: 'defense',
      name: 'Defense',
      description: 'Armed Forces',
      icon: '🛡️',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('army') || job.organization?.toLowerCase().includes('navy') || job.organization?.toLowerCase().includes('air force')).length,
      departments: ['Army', 'Navy', 'Air Force']
    },
    {
      id: 'teaching',
      name: 'Education',
      description: 'Teaching Jobs',
      icon: '📚',
      jobCount: filteredJobs.filter(job => job.organization?.toLowerCase().includes('education') || job.organization?.toLowerCase().includes('university')).length,
      departments: ['Universities', 'Schools']
    }
  ]

  // Stats removed - not currently used in the UI

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 space-y-4 sm:space-y-6">
      {/* Enhanced Welcome Header with Features */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              {isAuthenticated ? `Welcome, ${(user as any)?.name || 'User'}!` : 'Welcome to Applyze'}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-4">
              Revolutionizing how candidates apply to government jobs - from finding to applying
            </p>
            <div className="text-white/90 text-sm sm:text-base">
              <span className="font-semibold">{filteredJobs.length}</span> government jobs available
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/auto-apply"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
                >
                  <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Auto Apply</div>
                    <div className="text-xs text-blue-100">AI-powered applications</div>
                  </div>
                </Link>
                <Link
                  to="/documents"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
                >
                  <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Document Manager</div>
                    <div className="text-xs text-blue-100">Smart document handling</div>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signin"
                  className="bg-white text-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Search & Filters */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search government jobs..."
            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-1.5">
          <select 
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            value={selectedFilters.location}
            onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
          >
            <option value="">All Locations</option>
            <option value="delhi">Delhi</option>
            <option value="mumbai">Mumbai</option>
            <option value="bangalore">Bangalore</option>
            <option value="pan-india">Pan India</option>
          </select>
          <select 
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            value={selectedFilters.department}
            onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
          >
            <option value="">All Organizations</option>
            {uniqueOrganizations.slice(0, 8).map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
        
        {/* Category Pills - Compact */}
        <div>
          <p className="text-xs text-gray-600 mb-1.5">Categories:</p>
          <div className="flex flex-wrap gap-1.5">
            {jobCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  setSearchTerm('')
                }}
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm">{category.icon}</span>
                <span>{category.name}</span>
                <span className={`text-xs px-1 py-0.5 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>{category.jobCount}</span>
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
              >
                <span>Clear</span>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>



      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Jobs ({filteredJobs.length})
          </h2>
          <button
            onClick={fetchGovernmentJobs}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <Search className="h-3 w-3" />
            )}
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">
                <ExternalLink className="h-5 w-5" />
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Discovering government jobs using AI...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Building className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">No jobs found. Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredJobs.slice(0, 24).map((job) => (
                <div key={job.id} className="group bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 hover:border-blue-200 hover:-translate-y-1">
                  <div className="space-y-4">
                    {/* Job Title & Organization */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">{job.title}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                          <Building2 className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-gray-600 text-xs truncate font-medium">{job.organization || job.company}</span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full font-semibold shadow-sm">
                        {job.job_type || 'Government'}
                      </span>
                    </div>
                    
                    {/* Key Information Grid */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="p-1 bg-green-100 rounded-lg">
                          <MapPin className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="truncate font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-red-100 rounded-lg">
                          <Clock className="h-3 w-3 text-red-600" />
                        </div>
                        <span className="text-red-600 font-semibold truncate">
                          {job.apply_last_date || job.application_deadline || job.last_date || 'Check notification'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Vacancies: {(job as any).vacancies || 'Multiple'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <TrendingUp className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Fee: {(job as any).fee ? `₹${(job as any).fee}` : 'As per category'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {job.job_type ? `${job.job_type.toUpperCase()}` : 'Government'} • {job.contract_or_permanent ? job.contract_or_permanent : 'Permanent'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job)
                          setShowJobDetails(true)
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                      >
                        <Eye className="h-3 w-3" />
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
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Apply</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
