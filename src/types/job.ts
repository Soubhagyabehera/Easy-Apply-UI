export interface DocumentRequirement {
  name: string
  required: boolean
  maxSize?: string
  format?: string[]
  description?: string
}

export interface AgeLimit {
  min?: number
  max?: number
  relaxations?: Record<string, number>
}

export interface EligibilityCriteria {
  education_qualification?: string[]
  age_limit?: AgeLimit
  experience_required?: string
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
  
  // New comprehensive fields for government jobs
  vacancies?: number
  category_wise_vacancies?: Record<string, number>
  fee?: number  // Backward compatibility
  fee_structure?: Record<string, number>
  job_description?: string
  eligibility_criteria?: EligibilityCriteria
  required_documents?: string[]
  selection_process?: string[]
  pay_scale?: string
  application_mode?: 'online' | 'offline' | 'walk-in'
  application_status?: 'open' | 'closed' | 'upcoming'
  exam_date?: string
  admit_card_release_date?: string
  result_date?: string
  official_notification_link?: string
  official_website?: string
  application_deadline?: string
  contract_or_permanent?: 'contract' | 'permanent'
  job_type?: 'central' | 'state' | 'psu'
  source?: string
  created_at?: string
  updated_at?: string
  status?: 'active' | 'admit-card' | 'results' | 'closed'
  
  // Legacy/backward compatibility fields (actively used)
  organization?: string  // Maps to company - used in search/filtering
  apply_last_date?: string  // Maps to posted_date - used in deadline sorting
  last_date?: string  // Used in job expiration logic
  department?: string  // Used in search functionality
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
