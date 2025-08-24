import { useState, useEffect } from 'react'
import { User } from '../types/user'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { 
  Edit3, 
  Target, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Briefcase,
  Users,
  Search,
  Activity,
  Clock,
  AlertCircle,
  Mail,
  BookOpen,
  MessageSquare
} from 'lucide-react'

interface Activity {
  type: 'application' | 'document'
  title: string
  company?: string
  date: string
  status: string
}

interface ProfileStats {
  profile_completion: number
  applications: {
    total: number
    active: number
    selected: number
    rejected: number
    success_rate: number
  }
  documents: {
    total: number
    verified: number
    pending: number
    missing: number
  }
  activity: {
    login_streak: number
    total_sessions: number
    avg_session_time: string
  }
  achievements: Array<{
    title: string
    description: string
    earned: boolean
  }>
  goals: Array<{
    title: string
    progress: number
    target: number
  }>
  insights: string[]
}

interface JobPreferences {
  categories: string[]
  locations: string[]
  job_types: string[]
}

const ProfilePage = () => {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>({ categories: [], locations: [], job_types: [] })
  const [availableJobs, setAvailableJobs] = useState<Record<string, number>>({})
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showEditPreferences, setShowEditPreferences] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    qualification: '',
    experience_years: 0,
    preferred_categories: [] as string[],
    preferred_locations: [] as string[],
    preferred_job_types: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }


  useEffect(() => {
    const loadProfileData = async () => {
      if (authUser) {
        setError(null)
        setIsLoading(true)
        try {
          // Load user data and stats in parallel for better performance
          const [userData, statsData] = await Promise.all([
            userService.getCurrentUser(),
            userService.getProfileStats()
          ])
          
          setUser(userData)
          setEditForm({
            full_name: userData.full_name || userData.name || '',
            phone: userData.phone || '',
            location: userData.location || '',
            qualification: userData.qualification || '',
            experience_years: userData.experience_years || 0,
            preferred_categories: userData.preferred_categories || [],
            preferred_locations: userData.preferred_locations || [],
            preferred_job_types: userData.preferred_job_types || []
          })

          if (statsData) {
            setStats({
              profile_completion: statsData.stats?.profile_completion || statsData.profile_completion || 0,
              applications: statsData.stats?.applications || statsData.applications || { total: 0, active: 0, selected: 0, rejected: 0, success_rate: 0 },
              documents: statsData.stats?.documents || statsData.documents || { total: 0, verified: 0, pending: 0, missing: 0 },
              activity: statsData.stats?.activity || statsData.activity || { login_streak: 0, total_sessions: 0, avg_session_time: '0m' },
              achievements: statsData.stats?.achievements || statsData.achievements || [],
              goals: statsData.stats?.goals || statsData.goals || [],
              insights: statsData.stats?.insights || statsData.insights || []
            })
            setJobPreferences({
              categories: statsData.job_preferences?.categories || [],
              locations: statsData.job_preferences?.locations || [],
              job_types: statsData.job_preferences?.job_types || []
            })
            setAvailableJobs(statsData.available_jobs || {})
            setRecentActivity(statsData.recent_activity || [])
          }
        } catch (err) {
          if (err instanceof Error && err.message === 'No authentication token found') {
            setError('Please sign in to view your profile')
            navigate('/signin')
          } else {
            setError('Failed to load profile data. Please try again.')
          }
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadProfileData()
  }, [authUser, navigate])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await userService.updateProfile(editForm)
      if (response.success) {
        setUser(prev => prev ? { ...prev, ...editForm } : null)
        setJobPreferences({
          categories: editForm.preferred_categories,
          locations: editForm.preferred_locations,
          job_types: editForm.preferred_job_types
        })
        setShowEditProfile(false)
        // Refresh stats to update profile completion
        const updatedStats = await userService.getProfileStats()
        setStats(updatedStats.stats)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      full_name: user?.full_name || user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      qualification: user?.qualification || '',
      experience_years: user?.experience_years || 0,
      preferred_categories: user?.preferred_categories || [],
      preferred_locations: user?.preferred_locations || [],
      preferred_job_types: user?.preferred_job_types || []
    })
    setShowEditProfile(false)
  }


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">{error}</p>
          {error.includes('sign in') && (
            <button
              onClick={() => navigate('/signin')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading || !user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-b-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.full_name || user.name}
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-semibold text-white">
                      {(user.full_name || user.name).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{user.full_name || user.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">{user.email}</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    <div className="h-2 w-20 sm:w-32 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${stats.profile_completion}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{stats.profile_completion}% complete</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowEditProfile(true)
                setTimeout(() => scrollToSection('edit-profile-section'), 100)
              }}
              className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Job Preferences & Available Jobs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Job Preferences
                </h2>
                <button 
                  onClick={() => {
                    setShowEditPreferences(true)
                    setTimeout(() => scrollToSection('edit-preferences-section'), 100)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
              
              {jobPreferences.categories.length === 0 && jobPreferences.locations.length === 0 && jobPreferences.job_types.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Set your job preferences</p>
                  <button 
                    onClick={() => {
                      setShowEditPreferences(true)
                      setTimeout(() => scrollToSection('edit-preferences-section'), 100)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Preferences
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobPreferences.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobPreferences.categories.slice(0, 3).map(category => (
                          <span key={category} className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                            {category}
                            <span className="ml-1 text-blue-500 dark:text-blue-400">({availableJobs[category] || 0})</span>
                          </span>
                        ))}
                        {jobPreferences.categories.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{jobPreferences.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {jobPreferences.locations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locations</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobPreferences.locations.slice(0, 3).map(location => (
                          <span key={location} className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location}
                          </span>
                        ))}
                        {jobPreferences.locations.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{jobPreferences.locations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {jobPreferences.job_types.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobPreferences.job_types.map(type => (
                          <span key={type} className="inline-flex items-center px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Edit Preferences Form */}
            {showEditPreferences && (
              <div id="edit-preferences-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Job Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preferred Categories</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {['Banking', 'Railways', 'SSC', 'UPSC', 'State PSC', 'Teaching', 'Defence', 'Police'].map(category => (
                        <label key={category} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={editForm.preferred_categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({ ...editForm, preferred_categories: [...editForm.preferred_categories, category] })
                              } else {
                                setEditForm({ ...editForm, preferred_categories: editForm.preferred_categories.filter(c => c !== category) })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 leading-tight">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preferred Locations</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'All India'].map(location => (
                        <label key={location} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={editForm.preferred_locations.includes(location)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({ ...editForm, preferred_locations: [...editForm.preferred_locations, location] })
                              } else {
                                setEditForm({ ...editForm, preferred_locations: editForm.preferred_locations.filter(l => l !== location) })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 leading-tight">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Job Types</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      {['Full Time', 'Part Time', 'Contract', 'Permanent'].map(type => (
                        <label key={type} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            checked={editForm.preferred_job_types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({ ...editForm, preferred_job_types: [...editForm.preferred_job_types, type] })
                              } else {
                                setEditForm({ ...editForm, preferred_job_types: editForm.preferred_job_types.filter(t => t !== type) })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 leading-tight">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowEditPreferences(false)}
                    className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Application Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Application Summary</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.applications.total}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">Total Applied</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.applications.active}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 font-medium">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.applications.selected}</div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">Selected</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.applications.success_rate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Document Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Document Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.documents.total}</div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">Uploaded</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.documents.pending}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 font-medium">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.documents.missing}</div>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">Missing</div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            {showEditProfile ? (
              <div id="edit-profile-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your city/state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highest Qualification</label>
                    <select
                      value={editForm.qualification}
                      onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select qualification</option>
                      <option value="10th">10th Pass</option>
                      <option value="12th">12th Pass</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (Years)</label>
                    <select
                      value={editForm.experience_years}
                      onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value={0}>Fresher</option>
                      <option value={1}>1 Year</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years</option>
                      <option value={4}>4 Years</option>
                      <option value={5}>5+ Years</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.phone}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Joined {formatDate(user.created_at)}</span>
                    </div>
                    {user.qualification && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.qualification}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/documents')}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <FileText className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Manage Documents
                </button>
                <button
                  onClick={() => navigate('/applications')}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Briefcase className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Track Applications
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Search className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Find Jobs
                </button>
                <button
                  onClick={() => navigate('/community')}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Users className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Community
                </button>
              </div>
            </div>

            {/* Real Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity: Activity, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`p-1 rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-600' : activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                        {activity.type === 'application' ? (
                          <Briefcase className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        {activity.company && (
                          <p className="text-xs text-gray-600 dark:text-gray-300">{activity.company}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-600' : activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">No recent activity</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start applying to jobs or upload documents</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[280px] flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                Activity Stats
              </h3>
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Streak</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.activity.login_streak} days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Sessions</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.activity.total_sessions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Session Time</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.activity.avg_session_time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
