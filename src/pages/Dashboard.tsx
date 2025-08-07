import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Filter, MapPin, Building, Clock, Users, TrendingUp, Bell, 
  ExternalLink, Calendar, Building2, FileText, Star, ChevronRight 
} from 'lucide-react'
import { jobService } from '../services/jobService'
import { Job, JobCategory } from '../types/job'

export default function Dashboard() {
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
  
  // Filter jobs based on search term
  const filteredJobs = governmentJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Get unique organizations for filter options
  const uniqueOrganizations = [...new Set(governmentJobs.map(job => job.organization).filter(Boolean))]

  // Mock government job categories
  const jobCategories: JobCategory[] = [
    {
      id: 'banking',
      name: 'Banking & Finance',
      description: 'SBI, IBPS, RBI and other banking jobs',
      icon: '🏦',
      jobCount: 1245,
      departments: ['SBI', 'IBPS', 'RBI', 'NABARD']
    },
    {
      id: 'railway',
      name: 'Railway Jobs',
      description: 'Indian Railways recruitment',
      icon: '🚂',
      jobCount: 892,
      departments: ['Indian Railways', 'Metro Rail', 'RRBS']
    },
    {
      id: 'ssc',
      name: 'SSC Jobs',
      description: 'Staff Selection Commission',
      icon: '📋',
      jobCount: 2156,
      departments: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC JE']
    },
    {
      id: 'upsc',
      name: 'UPSC Jobs',
      description: 'Civil Services and other UPSC exams',
      icon: '🏛️',
      jobCount: 567,
      departments: ['IAS', 'IPS', 'IFS', 'Central Services']
    },
    {
      id: 'defense',
      name: 'Defense Jobs',
      description: 'Army, Navy, Air Force recruitment',
      icon: '🛡️',
      jobCount: 743,
      departments: ['Indian Army', 'Indian Navy', 'Indian Air Force', 'BSF']
    },
    {
      id: 'teaching',
      name: 'Teaching Jobs',
      description: 'Education sector opportunities',
      icon: '📚',
      jobCount: 1834,
      departments: ['CBSE', 'UGC', 'NCERT', 'State Education']
    },
    {
      id: 'police',
      name: 'Police Jobs',
      description: 'State and Central police forces',
      icon: '👮',
      jobCount: 923,
      departments: ['State Police', 'CRPF', 'CISF', 'BSF']
    },
    {
      id: 'healthcare',
      name: 'Healthcare Jobs',
      description: 'Medical and healthcare positions',
      icon: '🏥',
      jobCount: 654,
      departments: ['AIIMS', 'ESIC', 'State Health', 'CGHS']
    }
  ]

  const stats = [
    { label: 'Total Jobs', value: '9,014', icon: Building2, color: 'blue' },
    { label: 'Applications', value: '1,234', icon: FileText, color: 'green' },
    { label: 'Interviews', value: '23', icon: Users, color: 'purple' },
    { label: 'Success Rate', value: '78%', icon: TrendingUp, color: 'orange' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Government Jobs Portal</h1>
            <p className="text-blue-100 text-lg">
              Discover thousands of government job opportunities across India
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/auto-apply"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
            >
              <Star className="h-5 w-5" />
              <span>Enable Auto Apply</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Filters</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedFilters.department}
            onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
          >
            <option value="">All Organizations</option>
            {uniqueOrganizations.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedFilters.jobType}
            onChange={(e) => setSelectedFilters({...selectedFilters, jobType: e.target.value})}
          >
            <option value="">All Job Types</option>
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
            <option value="contract">Contract</option>
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedFilters.experience}
            onChange={(e) => setSelectedFilters({...selectedFilters, experience: e.target.value})}
          >
            <option value="">All Experience</option>
            <option value="fresher">Fresher</option>
            <option value="1-3">1-3 Years</option>
            <option value="3-5">3-5 Years</option>
            <option value="5+">5+ Years</option>
          </select>
        </div>
      </div>

      {/* Job Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/categories" className="text-blue-600 hover:text-blue-700 font-medium">
            View All Categories
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{category.icon}</div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">{category.jobCount} jobs</span>
                <span className="text-xs text-gray-500">{category.departments.length} depts</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search government jobs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchGovernmentJobs}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{loading ? 'Loading...' : 'Refresh Jobs'}</span>
          </button>
        </div>
      </div>

      {/* Government Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Government Jobs ({filteredJobs.length})
          </h2>
          <div className="text-sm text-gray-500">
            Powered by OpenAI Discovery
          </div>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No government jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredJobs.slice(0, 10).map((job, index) => (
                <div key={job.id} className={`p-6 ${index !== filteredJobs.slice(0, 10).length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {job.job_type || 'Government'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-600">{job.organization || job.company}</p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Last Date: {job.last_date || 'Check notification'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted: {job.posted_date || 'Recently'}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {job.apply_url && (
                        <a
                          href={job.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Apply Now</span>
                        </a>
                      )}
                      {job.career_url && (
                        <a
                          href={job.career_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Building className="h-4 w-4" />
                          <span>Career Page</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
