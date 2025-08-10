import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Building, DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { jobService } from '../services/jobService'
import { Job } from '../types/job'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return
      
      try {
        const jobData = await jobService.getJobById(parseInt(id))
        setJob(jobData)
      } catch (error) {
        console.error('Failed to fetch job:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="px-3 sm:px-4 lg:px-0">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist.</p>
          <Link to="/jobs" className="mt-4 btn-primary inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-0">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <Link
          to="/jobs"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Back to Jobs
        </Link>
      </div>

      {/* Job Header */}
      <div className="card mb-6 sm:mb-8">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
          <div className="flex-1 min-w-0">
            {/* Job Title - Responsive and properly wrapped */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight break-words">
              {job.title}
            </h1>
            
            {/* Company and Location - Stack on mobile, inline on larger screens */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-gray-600 mb-4 sm:mb-6">
              <div className="flex items-center">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base truncate">{job.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base truncate">{job.location}</span>
              </div>
              {job.salary_range && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{job.salary_range}</span>
                </div>
              )}
            </div>

            {/* Skills/Requirements Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {job.requirements.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 text-xs sm:text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
              {job.requirements.length > 6 && (
                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full">
                  +{job.requirements.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Apply Button - Full width on mobile, fixed width on larger screens */}
          <div className="w-full sm:w-auto sm:ml-6 sm:flex-shrink-0">
            <button className="w-full sm:w-auto btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 font-medium">
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Job Description and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">Requirements</h3>
            <ul className="space-y-2 sm:space-y-3">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-600 rounded-full mt-2 mr-2 sm:mr-3"></span>
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Job Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-500 block">Company</span>
                <p className="text-gray-900 text-sm sm:text-base mt-1">{job.company}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-500 block">Location</span>
                <p className="text-gray-900 text-sm sm:text-base mt-1">{job.location}</p>
              </div>
              {job.salary_range && (
                <div>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 block">Salary Range</span>
                  <p className="text-gray-900 text-sm sm:text-base mt-1">{job.salary_range}</p>
                </div>
              )}
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-500 block">Job Type</span>
                <p className="text-gray-900 text-sm sm:text-base mt-1">Full-time</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Share this Job</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5">
                Copy Link
              </button>
              <button className="btn-secondary p-2 sm:p-2.5">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
