export interface UserProfile {
  skills: string[]
  experience_years: number
  location: string
}

export interface User {
  id: number
  email: string
  full_name: string
  picture?: string
  profile?: UserProfile
  is_active: boolean
}
