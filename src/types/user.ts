export interface UserProfile {
  skills: string[]
  experience_years: number
  location: string
}

export interface User {
  id: number
  email: string
  name: string
  full_name?: string
  phone?: string
  location?: string
  qualification?: string
  experience_years?: number
  preferred_categories?: string[]
  preferred_locations?: string[]
  preferred_job_types?: string[]
  picture?: string
  profile?: UserProfile
  is_active: boolean
  created_at: string
}
