import { Link } from 'react-router-dom'
import { Search, Briefcase, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="px-4 sm:px-0">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Find Your Dream Job with{' '}
          <span className="text-primary-600">JobBot</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Discover thousands of job opportunities that match your skills and preferences. 
          Let AI help you find the perfect career match.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/jobs" className="btn-primary text-lg px-8 py-3">
            Browse Jobs
          </Link>
          <Link to="/profile" className="btn-secondary text-lg px-8 py-3">
            Create Profile
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose JobBot?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Powered by AI to match you with the best opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Advanced AI algorithms to find jobs that perfectly match your skills and preferences.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Briefcase className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Jobs</h3>
            <p className="text-gray-600">
              Curated job listings from top companies across various industries and locations.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Growth</h3>
            <p className="text-gray-600">
              Track your applications and get insights to accelerate your career progression.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 rounded-2xl py-16 px-8 text-white text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold">10K+</div>
            <div className="text-primary-100 mt-2">Active Jobs</div>
          </div>
          <div>
            <div className="text-4xl font-bold">5K+</div>
            <div className="text-primary-100 mt-2">Companies</div>
          </div>
          <div>
            <div className="text-4xl font-bold">50K+</div>
            <div className="text-primary-100 mt-2">Job Seekers</div>
          </div>
        </div>
      </div>
    </div>
  )
}
