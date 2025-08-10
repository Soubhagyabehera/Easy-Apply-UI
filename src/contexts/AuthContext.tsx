import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/user'
import { userService } from '../services/userService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication on app load
    const initializeAuth = async () => {
      try {
        const storedUser = userService.getStoredUser()
        const isAuth = userService.isAuthenticated()

        if (isAuth && storedUser) {
          // Verify token is still valid by making a request
          try {
            const currentUser = await userService.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            // Token is invalid, clear storage
            userService.logout()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        userService.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (userData: User, token: string) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    userService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      if (userService.isAuthenticated()) {
        const currentUser = await userService.getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
