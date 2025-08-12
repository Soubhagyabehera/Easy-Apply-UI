import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { userService, GoogleTokenData } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'

const SignUpPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    if (userService.isAuthenticated()) {
      navigate('/')
      return
    }
  }, [navigate])

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true)
    setError(null)

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      // Send the credential directly to our backend
      const authResponse = await userService.googleAuth({
        credential: credentialResponse.credential
      })
      
      console.log('Sign-up successful:', authResponse.user)
      
      // Update AuthContext with user and token
      login(authResponse.user, authResponse.access_token)
      
      // Redirect to main page
      navigate('/')
    } catch (err: any) {
      console.error('Sign-up failed:', err)
      setError(err.response?.data?.detail || 'Sign-up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-up was cancelled or failed. Please try again.')
  }

  const handleDemoSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      // Demo user for testing without Google OAuth
      const demoTokenData: GoogleTokenData = {
        sub: 'demo_user_456',
        email: 'newdemo@Applyze.com',
        name: 'New Demo User',
        picture: '',
      }

      const authResponse = await userService.googleAuth(demoTokenData)
      console.log('Demo sign up successful:', authResponse.user)
      
      // Update AuthContext with user and token
      login(authResponse.user, authResponse.access_token)
      
      navigate('/')
    } catch (err: any) {
      console.error('Demo sign up failed:', err)
      setError(err.response?.data?.detail || 'Demo sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-4 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-8">
        <div>
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Join Applyze
          </h2>
          <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-gray-600">
            Start your journey with AI-powered job applications
          </p>
        </div>

        <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 sm:p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm">
                  By signing up, you'll get access to job discovery, document management, and application automation features.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Google Sign Up Button */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="medium"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-gradient-to-br from-green-50 to-blue-100 text-gray-500">
                  Or
                </span>
              </div>
            </div>

            {/* Demo Sign Up Button */}
            <button
              onClick={handleDemoSignUp}
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-3 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Creating account...' : 'Create Demo Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Features Preview */}
          <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">What you'll get:</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
              <li className="flex items-center">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-powered government job discovery
              </li>
              <li className="flex items-center">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Document management & formatting
              </li>
              <li className="flex items-center">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Application tracking & automation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
