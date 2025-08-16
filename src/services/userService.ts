import { User } from '../types/user'
import { apiClient, API_ENDPOINTS } from '../config/api'

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
    const response = await apiClient.post(API_ENDPOINTS.users.auth.google, googleToken)
    const authData = response.data
    
    // Store token and user data
    localStorage.setItem('access_token', authData.access_token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    
    return authData
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.users.me)
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
    const response = await apiClient.put(API_ENDPOINTS.users.me, userData)
    const updatedUser = response.data
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    return updatedUser
  },

  // User management methods
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get(API_ENDPOINTS.users.base)
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.users.byId(id))
    return response.data
  },

  async createUser(user: Omit<User, 'id' | 'is_active'>): Promise<User> {
    const response = await apiClient.post(API_ENDPOINTS.users.base, user)
    return response.data
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await apiClient.put(API_ENDPOINTS.users.byId(id), user)
    return response.data
  },

  // Document management methods (for Phase 2)
  async getUserDocuments(userId: number): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.users.documents(userId))
    return response.data
  },

  async uploadDocument(userId: number, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(API_ENDPOINTS.users.documents(userId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteDocument(userId: number, docId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.users.document(userId, docId))
  },
}
