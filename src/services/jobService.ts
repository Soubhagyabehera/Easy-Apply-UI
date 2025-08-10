import axios from 'axios'
import { Job } from '../types/job'

const API_BASE_URL = 'https://easy-apply-backend-production.up.railway.app/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    const response = await api.get('/jobs/')
    
    // Handle the new response format: { status: "success", count: number, data: Job[] }
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    // Fallback for direct array response (backward compatibility)
    return Array.isArray(response.data) ? response.data : []
  },

  async getJobById(id: number): Promise<Job> {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  async createJob(job: Omit<Job, 'id' | 'is_active'>): Promise<Job> {
    const response = await api.post('/jobs/', job)
    return response.data
  },

  async updateJob(id: number, job: Partial<Job>): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, job)
    return response.data
  },

  async deleteJob(id: number): Promise<void> {
    await api.delete(`/jobs/${id}`)
  },

  async getGovernmentJobs(filters?: {
    location?: string
    organization?: string
    department?: string
  }): Promise<Job[]> {
    const params = new URLSearchParams()
    if (filters?.location) params.append('location', filters.location)
    if (filters?.organization) params.append('organization', filters.organization)
    if (filters?.department) params.append('department', filters.department)
    
    // Updated to use the new jobs endpoint that returns consistent JSON format
    const response = await api.get(`/jobs/?${params.toString()}`)
    
    // Handle the new response format: { status: "success", count: number, data: Job[] }
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    // Fallback for direct array response (backward compatibility)
    return Array.isArray(response.data) ? response.data : []
  },

  async discoverJobs(): Promise<any> {
    const response = await api.get('/jobs/discover')
    return response.data
  },
}
