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
              
              {job.pay_scale && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pay Scale</p>
                    <p className="text-sm font-semibold text-gray-900">{job.pay_scale}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-semibold text-gray-900">{job.contract_or_permanent || 'Permanent'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold text-gray-900">{job.application_status || 'Open'}</p>
                </div>
              </div>
            </div>

            {/* Apply Button - Prominent and Mobile-First */}
            {job.apply_link ? (
              <a 
                href={job.apply_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 block text-center"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>Apply Now</span>
                </div>
              </a>
            ) : (
              <button className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl cursor-not-allowed">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Application Link Not Available</span>
                </div>
              </button>
            )}
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
              <p className="text-gray-700 leading-relaxed">{job.job_description || job.description || 'No description available.'}</p>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Eligibility Criteria
            </h3>
            {job.eligibility_criteria ? (
              <div className="space-y-4">
                {job.eligibility_criteria.education_qualification && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Education Qualification</h4>
                    <ul className="space-y-1">
                      {job.eligibility_criteria.education_qualification.map((edu, index) => (
                        <li key={index} className="text-gray-700 flex items-start space-x-2">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {job.eligibility_criteria.age_limit && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Age Limit</h4>
                    <p className="text-gray-700">
                      {job.eligibility_criteria.age_limit.min && job.eligibility_criteria.age_limit.max 
                        ? `${job.eligibility_criteria.age_limit.min} - ${job.eligibility_criteria.age_limit.max} years`
                        : 'As per notification'}
                    </p>
                    {job.eligibility_criteria.age_limit.relaxations && Object.keys(job.eligibility_criteria.age_limit.relaxations).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-green-800 mb-1">Age Relaxations:</p>
                        <ul className="text-sm text-gray-600">
                          {Object.entries(job.eligibility_criteria.age_limit.relaxations).map(([category, years]) => (
                            <li key={category}>{category}: +{years} years</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {job.eligibility_criteria.experience_required && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Experience Required</h4>
                    <p className="text-gray-700">{job.eligibility_criteria.experience_required}</p>
                  </div>
                )}
                {job.eligibility_criteria.other_requirement && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Other Requirements</h4>
                    <p className="text-gray-700">{job.eligibility_criteria.other_requirement}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No specific eligibility criteria listed.</p>
            )}
          </div>
        </div>

        {/* Selection Process Section */}
        {job.selection_process && job.selection_process.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Selection Process
              </h3>
              <div className="space-y-3">
                {job.selection_process.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Required Documents Section */}
        {job.required_documents && job.required_documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.required_documents.map((document, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <span className="text-gray-700 leading-relaxed">{document}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600 mb-1">Application Deadline</p>
                <p className="text-gray-900 font-semibold">{job.application_deadline || 'Check notification'}</p>
              </div>
              
              {/* Category-wise Vacancies */}
              {job.category_wise_vacancies && Object.keys(job.category_wise_vacancies).length > 0 ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-2">Category-wise Vacancies</p>
                  <div className="space-y-1">
                    {Object.entries(job.category_wise_vacancies).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-700">{category}:</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : job.vacancies ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-1">Total Vacancies</p>
                  <p className="text-gray-900 font-semibold">{job.vacancies}</p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-1">Vacancies</p>
                  <p className="text-gray-900 font-semibold">Check notification</p>
                </div>
              )}
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600 mb-1">Application Mode</p>
                <p className="text-gray-900 font-semibold capitalize">{job.application_mode || 'Online'}</p>
              </div>
              
              {/* Fee Structure */}
              {job.fee_structure && Object.keys(job.fee_structure).length > 0 ? (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-600 mb-2">Application Fee</p>
                  <div className="space-y-1">
                    {Object.entries(job.fee_structure).map(([category, fee]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-700">{category}:</span>
                        <span className="font-semibold text-gray-900">₹{fee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : job.fee ? (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-600 mb-1">Application Fee</p>
                  <p className="text-gray-900 font-semibold">₹{job.fee}</p>
                </div>
              ) : null}
              
              {/* Important Dates */}
              {job.exam_date && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-600 mb-1">Exam Date</p>
                  <p className="text-gray-900 font-semibold">{new Date(job.exam_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {job.admit_card_release_date && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600 mb-1">Admit Card Release</p>
                  <p className="text-gray-900 font-semibold">{new Date(job.admit_card_release_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {job.result_date && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-medium text-indigo-600 mb-1">Result Date</p>
                  <p className="text-gray-900 font-semibold">{new Date(job.result_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            {/* Official Links */}
            {(job.official_notification_link || job.official_website) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Official Links</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  {job.official_notification_link && (
                    <a 
                      href={job.official_notification_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official Notification
                    </a>
                  )}
                  {job.official_website && (
                    <a 
                      href={job.official_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            )}
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
          {job.apply_link ? (
            <a 
              href={job.apply_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 block text-center"
            >
              Apply Now
            </a>
          ) : (
            <button className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl cursor-not-allowed">
              Application Link Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
