import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { userService, GoogleTokenData } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'

const SignInPage: React.FC = () => {
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
      
      console.log('Authentication successful:', authResponse.user)
      
      // Update AuthContext with user and token
      login(authResponse.user, authResponse.access_token)
      
      // Redirect to main page
      navigate('/')
    } catch (err: any) {
      console.error('Authentication failed:', err)
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
  }

  const handleDemoSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      // Demo user for testing without Google OAuth
      const demoTokenData: GoogleTokenData = {
        sub: 'demo_user_123',
        email: 'demo@easyapply.com',
        name: 'Demo User',
        picture: '',
      }

      const authResponse = await userService.googleAuth(demoTokenData)
      console.log('Demo authentication successful:', authResponse.user)
      
      // Update AuthContext with user and token
      login(authResponse.user, authResponse.access_token)
      
      navigate('/')
    } catch (err: any) {
      console.error('Demo authentication failed:', err)
      setError(err.response?.data?.detail || 'Demo authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-4 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-8">
        <div>
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to EasyApply
          </h2>
          <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-gray-600">
            Your AI-powered job application assistant
          </p>
        </div>

        <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="medium"
                    theme="outline"
                    text="signin_with"
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
                  <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">Or</span>
                </div>
              </div>

              {/* Demo Sign In Button */}
              <button
                onClick={handleDemoSignIn}
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-2 px-3 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Signing in...' : 'Continue with Demo Account'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
