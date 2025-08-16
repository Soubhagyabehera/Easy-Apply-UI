import { API_BASE_URL } from '../config/api';

export interface Application {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  department?: string;
  applied_date: string;
  status: 'applied' | 'document_verification' | 'exam_scheduled' | 'exam_completed' | 'interview_scheduled' | 'interview_completed' | 'result_pending' | 'selected' | 'rejected';
  application_id?: string;
  exam_date?: string;
  interview_date?: string;
  result_date?: string;
  application_fee?: string;
  documents?: string[];
  notes?: string;
  last_updated: string;
  reminder_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  job_title: string;
  company: string;
  department?: string;
  applied_date: string;
  status?: Application['status'];
  application_id?: string;
  exam_date?: string;
  interview_date?: string;
  result_date?: string;
  application_fee?: string;
  documents?: string[];
  notes?: string;
}

export interface ApplicationUpdate {
  job_title?: string;
  company?: string;
  department?: string;
  applied_date?: string;
  status?: Application['status'];
  application_id?: string;
  exam_date?: string;
  interview_date?: string;
  result_date?: string;
  application_fee?: string;
  documents?: string[];
  notes?: string;
}

export interface ApplicationStats {
  total_applications: number;
  applied_count: number;
  document_verification_count: number;
  exam_scheduled_count: number;
  exam_completed_count: number;
  interview_scheduled_count: number;
  interview_completed_count: number;
  result_pending_count: number;
  selected_count: number;
  rejected_count: number;
  last_activity?: string;
}

export interface ApplicationFilters {
  status?: string;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

class ApplicationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }
      
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getApplications(filters: ApplicationFilters = {}): Promise<Application[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/applications/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Application[]>(response);
  }

  async getApplication(id: string): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/applications/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Application>(response);
  }

  async createApplication(application: ApplicationCreate): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/applications`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(application),
    });

    return this.handleResponse<Application>(response);
  }

  async updateApplication(id: string, application: ApplicationUpdate): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/applications/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(application),
    });

    return this.handleResponse<Application>(response);
  }

  async deleteApplication(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/applications/applications/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async getApplicationStats(): Promise<ApplicationStats> {
    const response = await fetch(`${API_BASE_URL}/applications/applications/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ApplicationStats>(response);
  }

  async getPendingReminders(): Promise<{ count: number; applications: Application[] }> {
    const response = await fetch(`${API_BASE_URL}/applications/applications/reminders`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ count: number; applications: Application[] }>(response);
  }
}

export const applicationService = new ApplicationService();
