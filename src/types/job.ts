export interface DocumentRequirement {
  name: string
  required: boolean
  maxSize?: string
  format?: string[]
  description?: string
}

export interface Job {
  id: number
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  salary_range?: string
  is_active: boolean
  apply_url?: string
  posted_date?: string
  // Government job specific fields from backend
  organization?: string
  career_url?: string
  last_date?: string
  job_type?: string
  department?: string
  experience_required?: string
  // Additional frontend fields for compatibility
  category?: string
  jobType?: 'permanent' | 'temporary' | 'contract' | 'internship'
  eligibility?: {
    education: string[]
    experience: string
    ageLimit?: string
    nationality?: string
  }
  applicationDeadline?: string
  examDate?: string
  documents?: DocumentRequirement[]
  applicationFee?: string
  selectionProcess?: string[]
  vacancies?: number
  reservationDetails?: string
}

export interface JobCategory {
  id: string
  name: string
  description: string
  icon: string
  jobCount: number
  departments: string[]
}
