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

  async getJobById(jobId: string): Promise<Job> {
    const response = await api.get(`/jobs/${jobId}`)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Job not found')
  },

  async createJob(job: Omit<Job, 'job_id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const response = await api.post('/jobs/manual', job)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to create job')
  },

  async updateJob(jobId: string, job: Partial<Job>): Promise<Job> {
    const response = await api.put(`/jobs/${jobId}`, job)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to update job')
  },

  async deleteJob(jobId: string): Promise<void> {
    const response = await api.delete(`/jobs/${jobId}`)
    
    if (response.data && response.data.status !== 'success') {
      throw new Error(response.data?.message || 'Failed to delete job')
    }
  },

  async searchJobsAdvanced(filters: {
    limit?: number
    location?: string
    company?: string
    source?: string
    min_vacancies?: number
    max_fee?: number
    posted_after?: string
    search_term?: string
  }): Promise<Job[]> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/jobs/search/advanced?${params.toString()}`)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    return []
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
