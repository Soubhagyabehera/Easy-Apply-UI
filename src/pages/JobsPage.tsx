import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Building, DollarSign, Search } from 'lucide-react'
import { jobService } from '../services/jobService'
import { Job } from '../types/job'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await jobService.getAllJobs()
        setJobs(jobsData)
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
        <p className="mt-2 text-gray-600">
          Discover your next career opportunity from our curated job listings
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, or locations..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {job.title}
                  </Link>
                  
                  <div className="flex items-center mt-2 space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-gray-700 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{job.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
