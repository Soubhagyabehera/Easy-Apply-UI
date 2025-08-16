export interface DocumentRequirement {
  name: string
  required: boolean
  maxSize?: string
  format?: string[]
  description?: string
}

export interface EligibilityCriteria {
  education_qualification?: string
  age_limit?: string
  other_requirement?: string
}

export interface Job {
  // Primary key and core fields
  job_id: string
  title: string
  company: string
  location: string
  apply_link?: string
  posted_date?: string
  
  // New comprehensive fields
  vacancies?: number
  fee?: number
  job_description?: string
  eligibility_criteria?: EligibilityCriteria
  required_documents?: string[]
  application_deadline?: string
  contract_or_permanent?: 'contract' | 'permanent'
  job_type?: 'central' | 'state' | 'psu'
  source?: string
  created_at?: string
  updated_at?: string
  status?: 'active' | 'admit-card' | 'results' | 'closed'
  
  // Legacy/backward compatibility fields
  id?: number
  organization?: string  // Maps to company
  apply_last_date?: string  // Maps to posted_date
  description?: string  // Maps to job_description
  requirements?: string[]
  salary_range?: string
  is_active?: boolean
  apply_url?: string  // Maps to apply_link
  career_url?: string
  last_date?: string
  department?: string
  experience_required?: string
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
