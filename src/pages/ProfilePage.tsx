import { useState, useEffect } from 'react'
import { User, MapPin, Briefcase, Edit, Plus } from 'lucide-react'
import { userService } from '../services/userService'
import { User as UserType } from '../types/user'

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // For demo purposes, fetch the first user
        const users = await userService.getAllUsers()
        if (users.length > 0) {
          setUser(users[0])
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Create Your Profile</h2>
          <p className="mt-2 text-gray-600">Get started by creating your professional profile.</p>
          <button className="mt-4 btn-primary">
            Create Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your professional information and job preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {user.profile && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user.profile.location}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <div className="flex items-center mt-1">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user.profile.experience_years} years</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    <button className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center space-x-1">
                      <Plus className="h-3 w-3" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Basic Info</span>
                <span className="text-sm font-medium text-green-600">Complete</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Skills</span>
                <span className="text-sm font-medium text-green-600">Complete</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resume</span>
                <span className="text-sm font-medium text-yellow-600">Pending</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm text-gray-600 text-center">75% Complete</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Upload Resume
              </button>
              <button className="w-full btn-secondary">
                View Applications
              </button>
              <button className="w-full btn-secondary">
                Job Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
