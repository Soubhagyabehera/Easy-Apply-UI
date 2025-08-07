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
      <div className="px-4 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="px-4 sm:px-0">
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
    <div className="px-4 sm:px-0">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/jobs"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>

      {/* Job Header */}
      <div className="card mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {job.location}
              </div>
              {job.salary_range && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  {job.salary_range}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.requirements.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="ml-6">
            <button className="btn-primary text-lg px-8 py-3">
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Company</span>
                <p className="text-gray-900">{job.company}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location</span>
                <p className="text-gray-900">{job.location}</p>
              </div>
              {job.salary_range && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Salary Range</span>
                  <p className="text-gray-900">{job.salary_range}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Job Type</span>
                <p className="text-gray-900">Full-time</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this Job</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1">
                Copy Link
              </button>
              <button className="btn-secondary">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
