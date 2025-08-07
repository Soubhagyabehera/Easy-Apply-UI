import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, Filter, SortAsc, MapPin, Calendar, 
  Users, Clock, FileText, Bookmark, ExternalLink 
} from 'lucide-react'
import { Job } from '../types/job'

export default function CategoryJobsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    experience: '',
    jobType: '',
    sortBy: 'deadline'
  })

  // Mock category data
  const categoryInfo = {
    banking: {
      name: 'Banking & Finance Jobs',
      description: 'Explore opportunities in public sector banks, financial institutions, and regulatory bodies',
      icon: '🏦',
      departments: ['SBI', 'IBPS', 'RBI', 'NABARD', 'SIDBI', 'EXIM Bank']
    },
    railway: {
      name: 'Railway Jobs',
      description: 'Join Indian Railways - the backbone of India\'s transportation system',
      icon: '🚂',
      departments: ['Indian Railways', 'Metro Rail', 'RRBS', 'IRCTC', 'RITES']
    },
    ssc: {
      name: 'SSC Jobs',
      description: 'Staff Selection Commission - Gateway to Central Government jobs',
      icon: '📋',
      departments: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC JE', 'SSC CPO']
    },
    upsc: {
      name: 'UPSC Jobs',
      description: 'Union Public Service Commission - Premier civil services',
      icon: '🏛️',
      departments: ['IAS', 'IPS', 'IFS', 'Central Services', 'Engineering Services']
    },
    defense: {
      name: 'Defense Jobs',
      description: 'Serve the nation through Armed Forces and paramilitary',
      icon: '🛡️',
      departments: ['Indian Army', 'Indian Navy', 'Indian Air Force', 'BSF', 'CRPF']
    },
    teaching: {
      name: 'Teaching Jobs',
      description: 'Shape the future through education sector opportunities',
      icon: '📚',
      departments: ['CBSE', 'UGC', 'NCERT', 'State Education', 'KVS', 'NVS']
    },
    police: {
      name: 'Police Jobs',
      description: 'Maintain law and order through police services',
      icon: '👮',
      departments: ['State Police', 'CRPF', 'CISF', 'BSF', 'ITBP']
    },
    healthcare: {
      name: 'Healthcare Jobs',
      description: 'Serve humanity through medical and healthcare positions',
      icon: '🏥',
      departments: ['AIIMS', 'ESIC', 'State Health', 'CGHS', 'ICMR']
    }
  }

  const currentCategory = categoryInfo[categoryId as keyof typeof categoryInfo]

  // Mock jobs data for the category
  const mockJobs: Job[] = [
    {
      id: 1,
      title: 'Probationary Officer',
      company: 'State Bank of India',
      department: 'SBI',
      location: 'Pan India',
      description: 'SBI is recruiting Probationary Officers for various branches across India. This is a great opportunity for fresh graduates to start their banking career.',
      requirements: ['Graduate in any discipline', 'Age: 21-30 years'],
      salary_range: '₹23,700 - ₹42,020',
      category: categoryId,
      jobType: 'permanent',
      eligibility: {
        education: ['Graduate in any discipline from recognized university'],
        experience: 'Fresher',
        ageLimit: '21-30 years',
        nationality: 'Indian'
      },
      applicationDeadline: '2024-02-15',
      examDate: '2024-03-15',
      applicationFee: '₹750 (₹100 for SC/ST/PWD)',
      selectionProcess: ['Preliminary Exam', 'Main Exam', 'Group Exercise & Interview'],
      vacancies: 2000,
      reservationDetails: 'As per Government norms',
      documents: [
        { name: 'Graduation Certificate', required: true, maxSize: '2MB', format: ['PDF', 'JPG'] },
        { name: 'Caste Certificate', required: false, maxSize: '1MB', format: ['PDF'] },
        { name: 'Photo', required: true, maxSize: '100KB', format: ['JPG', 'PNG'] },
        { name: 'Signature', required: true, maxSize: '50KB', format: ['JPG', 'PNG'] }
      ],
      is_active: true,
      apply_url: 'https://sbi.co.in/careers',
      posted_date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Clerk',
      company: 'Institute of Banking Personnel Selection',
      department: 'IBPS',
      location: 'Various States',
      description: 'IBPS Clerk recruitment for public sector banks. Join the banking sector as a clerical cadre officer.',
      requirements: ['Graduate in any discipline', 'Age: 20-28 years'],
      salary_range: '₹11,765 - ₹31,540',
      category: categoryId,
      jobType: 'permanent',
      eligibility: {
        education: ['Graduate in any discipline'],
        experience: 'Fresher',
        ageLimit: '20-28 years',
        nationality: 'Indian'
      },
      applicationDeadline: '2024-02-20',
      examDate: '2024-03-20',
      applicationFee: '₹600 (₹100 for SC/ST/PWD)',
      selectionProcess: ['Preliminary Exam', 'Main Exam'],
      vacancies: 7855,
      reservationDetails: 'As per Government norms',
      documents: [
        { name: 'Graduation Certificate', required: true, maxSize: '2MB', format: ['PDF'] },
        { name: 'Photo', required: true, maxSize: '100KB', format: ['JPG'] },
        { name: 'Signature', required: true, maxSize: '50KB', format: ['JPG'] }
      ],
      is_active: true,
      apply_url: 'https://ibps.in',
      posted_date: '2024-01-10'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setJobs(mockJobs)
      setLoading(false)
    }, 1000)
  }, [categoryId])

  const filteredJobs = jobs.filter(job => {
    return (
      (!filters.department || job.department === filters.department) &&
      (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.jobType || job.jobType === filters.jobType)
    )
  })

  if (!currentCategory) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Category Not Found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Category Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{currentCategory.icon}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{currentCategory.name}</h1>
            <p className="text-blue-100 text-lg mb-4">{currentCategory.description}</p>
            <div className="flex flex-wrap gap-2">
              {currentCategory.departments.map((dept, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{filteredJobs.length}</div>
            <div className="text-blue-100">Active Jobs</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter Jobs</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
          >
            <option value="">All Departments</option>
            {currentCategory.departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Location"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.jobType}
            onChange={(e) => setFilters({...filters, jobType: e.target.value})}
          >
            <option value="">All Job Types</option>
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
            <option value="contract">Contract</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.experience}
            onChange={(e) => setFilters({...filters, experience: e.target.value})}
          >
            <option value="">All Experience</option>
            <option value="fresher">Fresher</option>
            <option value="1-3">1-3 Years</option>
            <option value="3-5">3-5 Years</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="posted">Recently Posted</option>
            <option value="vacancies">Most Vacancies</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {job.jobType}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {job.applicationDeadline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{job.vacancies} vacancies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Exam: {job.examDate}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Required Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.documents?.slice(0, 3).map((doc, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${
                            doc.required 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {doc.name} {doc.required && '*'}
                        </span>
                      ))}
                      {job.documents && job.documents.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{job.documents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-300 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Apply</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-green-600">{job.salary_range}</span>
                    <span className="text-gray-500">Fee: {job.applicationFee}</span>
                  </div>
                  <span className="text-gray-500">Posted: {job.posted_date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
