import { useState } from 'react'
import { 
  Zap, Settings, Play, Pause, CheckCircle, 
  AlertCircle, Clock, Target, Filter, Bell 
} from 'lucide-react'

export default function AutoApplyPage() {
  const [isAutoApplyEnabled, setIsAutoApplyEnabled] = useState(false)
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    locations: [] as string[],
    salaryRange: { min: '', max: '' },
    experience: '',
    jobType: [] as string[],
    maxApplicationsPerDay: 10,
    autoSubmit: false,
    notifyOnApplication: true
  })

  const categories = [
    { id: 'banking', name: 'Banking & Finance' },
    { id: 'railway', name: 'Railway Jobs' },
    { id: 'ssc', name: 'SSC Jobs' },
    { id: 'upsc', name: 'UPSC Jobs' },
    { id: 'defense', name: 'Defense Jobs' },
    { id: 'teaching', name: 'Teaching Jobs' },
    { id: 'police', name: 'Police Jobs' },
    { id: 'healthcare', name: 'Healthcare Jobs' }
  ]

  const locations = [
    'Pan India', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 
    'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'
  ]

  const jobTypes = [
    { id: 'permanent', name: 'Permanent' },
    { id: 'temporary', name: 'Temporary' },
    { id: 'contract', name: 'Contract' },
    { id: 'internship', name: 'Internship' }
  ]

  const recentApplications = [
    {
      id: 1,
      jobTitle: 'Probationary Officer',
      company: 'State Bank of India',
      appliedAt: '2024-01-20 10:30 AM',
      status: 'submitted',
      applicationId: 'SBI2024001'
    },
    {
      id: 2,
      jobTitle: 'Assistant Loco Pilot',
      company: 'Indian Railways',
      appliedAt: '2024-01-20 11:15 AM',
      status: 'pending',
      applicationId: 'IR2024002'
    },
    {
      id: 3,
      jobTitle: 'Staff Selection Commission',
      company: 'SSC CGL',
      appliedAt: '2024-01-20 12:00 PM',
      status: 'submitted',
      applicationId: 'SSC2024003'
    }
  ]

  const handleCategoryChange = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const handleLocationChange = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(loc => loc !== location)
        : [...prev.locations, location]
    }))
  }

  const handleJobTypeChange = (jobType: string) => {
    setPreferences(prev => ({
      ...prev,
      jobType: prev.jobType.includes(jobType)
        ? prev.jobType.filter(type => type !== jobType)
        : [...prev.jobType, jobType]
    }))
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Auto Apply</h1>
              <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                Let AI automatically apply to jobs that match your preferences
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {isAutoApplyEnabled ? 'Active' : 'Inactive'}
              </div>
              <div className="text-purple-100 text-sm sm:text-base">Auto Apply Status</div>
            </div>
            <button
              onClick={() => setIsAutoApplyEnabled(!isAutoApplyEnabled)}
              className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                isAutoApplyEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              {isAutoApplyEnabled ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span>{isAutoApplyEnabled ? 'Pause' : 'Start'} Auto Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Applications Today</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-green-100 flex-shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">85%</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">1</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-yellow-100 flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Applied</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">47</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-purple-100 flex-shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Preferences */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Auto Apply Preferences</h2>
            </div>

            {/* Job Categories */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Preferred Job Categories
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.categories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Preferred Locations
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {locations.map((location) => (
                  <label key={location} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.locations.includes(location)}
                      onChange={() => handleLocationChange(location)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Job Types
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {jobTypes.map((type) => (
                  <label key={type.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.jobType.includes(type.id)}
                      onChange={() => handleJobTypeChange(type.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={preferences.experience}
                onChange={(e) => setPreferences({...preferences, experience: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-3">1-3 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5+">5+ Years</option>
              </select>
            </div>

            {/* Application Limits */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Applications Per Day
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={preferences.maxApplicationsPerDay}
                onChange={(e) => setPreferences({...preferences, maxApplicationsPerDay: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.autoSubmit}
                  onChange={(e) => setPreferences({...preferences, autoSubmit: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">Auto-submit applications (no manual review)</span>
              </label>
              <label className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnApplication}
                  onChange={(e) => setPreferences({...preferences, notifyOnApplication: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">Send notifications for each application</span>
              </label>
            </div>

            <button className="w-full mt-4 sm:mt-6 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base">
              Save Preferences
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Auto Applications</h2>
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{application.jobTitle}</h3>
                      <p className="text-gray-600 text-sm truncate">{application.company}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {application.status === 'submitted' ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                      )}
                      <span className={`text-xs sm:text-sm font-medium ${
                        application.status === 'submitted' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {application.status === 'submitted' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <p>Applied: {application.appliedAt}</p>
                    <p className="truncate">Application ID: {application.applicationId}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              View All Applications
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Auto Apply will only submit applications for jobs that match your criteria</li>
                  <li>• Ensure your profile and documents are up-to-date</li>
                  <li>• Review application fees before enabling auto-submit</li>
                  <li>• Monitor your applications regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
