import axios from 'axios'
import { User } from '../types/user'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const userService = {
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
}
