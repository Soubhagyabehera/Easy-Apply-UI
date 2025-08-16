import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Building, DollarSign, ExternalLink, Clock, Briefcase, CheckCircle } from 'lucide-react'
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
        const jobData = await jobService.getJobById(id)
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <Link
            to="/jobs"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Jobs</span>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Job Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          {/* Company Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Government Job</p>
                <p className="text-lg font-bold text-gray-900">{job.company}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Job Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {job.title}
            </h1>
            
            {/* Key Info Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{job.location}</p>
                </div>
              </div>
              
              {job.salary_range && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salary</p>
                    <p className="text-sm font-semibold text-gray-900">{job.salary_range}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-semibold text-gray-900">Full-time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posted</p>
                  <p className="text-sm font-semibold text-gray-900">2 days ago</p>
                </div>
              </div>
            </div>

            {/* Apply Button - Prominent and Mobile-First */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Apply Now</span>
              </div>
            </button>
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Job Description
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Requirements & Qualifications
            </h3>
            {job.requirements && job.requirements.length > 0 ? (
              <div className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-700 leading-relaxed">{requirement}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific requirements listed.</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600 mb-1">Application Deadline</p>
                <p className="text-gray-900 font-semibold">Check notification</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600 mb-1">Vacancies</p>
                <p className="text-gray-900 font-semibold">Multiple positions</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600 mb-1">Experience</p>
                <p className="text-gray-900 font-semibold">As per notification</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-600 mb-1">Application Fee</p>
                <p className="text-gray-900 font-semibold">₹175</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this Job</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                Copy Link
              </button>
              <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Apply Button for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-20">
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  )
}
