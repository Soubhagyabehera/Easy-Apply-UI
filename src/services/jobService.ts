import { Job } from '../types/job'
import { apiClient, API_ENDPOINTS } from '../config/api'

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    const response = await apiClient.get(API_ENDPOINTS.jobs.base + '/')
    
    // Handle the new response format: { status: "success", count: number, data: Job[] }
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    // Fallback for direct array response (backward compatibility)
    return Array.isArray(response.data) ? response.data : []
  },

  async getJobById(jobId: string): Promise<Job> {
    const response = await apiClient.get(API_ENDPOINTS.jobs.byId(jobId))
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Job not found')
  },

  async createJob(job: Omit<Job, 'job_id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const response = await apiClient.post(API_ENDPOINTS.jobs.manual, job)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to create job')
  },

  async updateJob(jobId: string, job: Partial<Job>): Promise<Job> {
    const response = await apiClient.put(API_ENDPOINTS.jobs.byId(jobId), job)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data
    }
    
    throw new Error(response.data?.message || 'Failed to update job')
  },

  async deleteJob(jobId: string): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.jobs.byId(jobId))
    
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
    
    const response = await apiClient.get(`${API_ENDPOINTS.jobs.search.advanced}?${params.toString()}`)
    
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    return []
  },

  async getGovernmentJobs(filters?: {
    // Main filters
    location?: string
    qualification?: string
    job_type?: string
    employment_type?: string
    // Advanced filters
    department?: string
    salary?: string
    age_limit?: string
    application_status?: string
    application_mode?: string
    exam_date?: string
    // Legacy filters
    organization?: string
  }): Promise<Job[]> {
    const params = new URLSearchParams()
    
    // Add all filter parameters if they exist
    if (filters?.location) params.append('location', filters.location)
    if (filters?.qualification) params.append('qualification', filters.qualification)
    if (filters?.job_type) params.append('job_type', filters.job_type)
    if (filters?.employment_type) params.append('employment_type', filters.employment_type)
    if (filters?.department) params.append('department', filters.department)
    if (filters?.salary) params.append('salary', filters.salary)
    if (filters?.age_limit) params.append('age_limit', filters.age_limit)
    if (filters?.application_status) params.append('application_status', filters.application_status)
    if (filters?.application_mode) params.append('application_mode', filters.application_mode)
    if (filters?.exam_date) params.append('exam_date', filters.exam_date)
    if (filters?.organization) params.append('company', filters.organization) // Map to backend field
    
    // Use advanced search endpoint for comprehensive filtering
    const response = await apiClient.get(`${API_ENDPOINTS.jobs.search.advanced}?${params.toString()}`)
    
    // Handle the new response format: { status: "success", count: number, data: Job[] }
    if (response.data && response.data.status === 'success') {
      return response.data.data || []
    }
    
    // Fallback for direct array response (backward compatibility)
    return Array.isArray(response.data) ? response.data : []
  },

  async discoverJobs(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.jobs.discover)
    return response.data
  },
}
