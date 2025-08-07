import { useState, useEffect } from 'react'
import { jobService } from '../services/jobService'
import { Job } from '../types/job'

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const jobsData = await jobService.getAllJobs()
      setJobs(jobsData)
    } catch (err) {
      setError('Failed to fetch jobs')
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  }
}

export const useJob = (id: number) => {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        setError(null)
        const jobData = await jobService.getJobById(id)
        setJob(jobData)
      } catch (err) {
        setError('Failed to fetch job')
        console.error('Error fetching job:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJob()
    }
  }, [id])

  return {
    job,
    loading,
    error,
  }
}
