import axios from 'axios'
import { User } from '../types/user'

const API_BASE_URL = 'https://easy-apply-backend-production.up.railway.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface GoogleTokenData {
  sub?: string
  email?: string
  name?: string
  picture?: string
  credential?: string // For new @react-oauth/google format
}

export const userService = {
  // Authentication methods
  async googleAuth(googleToken: GoogleTokenData): Promise<AuthResponse> {
    const response = await api.post('/users/auth/google', googleToken)
    const authData = response.data
    
    // Store token and user data
    localStorage.setItem('access_token', authData.access_token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    
    return authData
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async updateCurrentUser(userData: { name?: string; picture?: string }): Promise<User> {
    const response = await api.put('/users/me', userData)
    const updatedUser = response.data
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    return updatedUser
  },

  // User management methods
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users/')
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async createUser(user: Omit<User, 'id' | 'is_active'>): Promise<User> {
    const response = await api.post('/users/', user)
    return response.data
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, user)
    return response.data
  },

  // Document management methods (for Phase 2)
  async getUserDocuments(userId: number): Promise<any[]> {
    const response = await api.get(`/users/${userId}/documents`)
    return response.data
  },

  async uploadDocument(userId: number, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/users/${userId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteDocument(userId: number, docId: number): Promise<void> {
    await api.delete(`/users/${userId}/documents/${docId}`)
  },
}
