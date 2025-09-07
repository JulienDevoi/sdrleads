'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface JobStatus {
  jobId: string
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED'
  startedAt: string
  finishedAt?: string
  duration: number
  progress: number
  estimatedLeads: number
  stats: any
  defaultDatasetId?: string
  resultsRetrieved?: boolean
}

interface SourcingJob {
  jobId: string
  criteria: {
    jobTitle: string
    keywords: string
    location: string
    numberOfLeads: number
  }
  startTime: string
  status?: JobStatus
}

interface JobProgressTrackerProps {
  jobs: SourcingJob[]
  onRemoveJob: (jobId: string) => void
  onRetrieveResults?: (jobId: string) => void
}

export function JobProgressTracker({ jobs, onRemoveJob, onRetrieveResults }: JobProgressTrackerProps) {
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({})
  const [isPolling, setIsPolling] = useState(false)

  // Poll job statuses
  useEffect(() => {
    if (jobs.length === 0) return

    const pollJobs = async () => {
      setIsPolling(true)
      
      for (const job of jobs) {
        // Skip if job is already completed
        const currentStatus = jobStatuses[job.jobId]
        if (currentStatus && ['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(currentStatus.status)) {
          continue
        }

        try {
          const response = await fetch(`/api/apollo-scraper/status?jobId=${job.jobId}`)
          const result = await response.json()
          
          if (response.ok && result.success) {
            setJobStatuses(prev => ({
              ...prev,
              [job.jobId]: result.job
            }))
          }
        } catch (error) {
          console.error(`Error polling job ${job.jobId}:`, error)
        }
      }
      
      setIsPolling(false)
    }

    // Poll immediately
    pollJobs()

    // Set up interval for active jobs
    const activeJobs = jobs.filter(job => {
      const status = jobStatuses[job.jobId]
      return !status || ['READY', 'RUNNING'].includes(status.status)
    })

    if (activeJobs.length > 0) {
      const interval = setInterval(pollJobs, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [jobs, jobStatuses])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'text-yellow-600 bg-yellow-100'
      case 'RUNNING': return 'text-blue-600 bg-blue-100'
      case 'SUCCEEDED': return 'text-green-600 bg-green-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      case 'TIMED-OUT': return 'text-orange-600 bg-orange-100'
      case 'ABORTED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'RUNNING':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'SUCCEEDED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'FAILED':
      case 'TIMED-OUT':
      case 'ABORTED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No active sourcing jobs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Previous Sourcing Jobs</h3>
        {isPolling && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Updating...
          </div>
        )}
      </div>

      {jobs.map((job) => {
        const status = jobStatuses[job.jobId]
        return (
          <Card key={job.jobId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status?.status || 'READY')}`}>
                    {getStatusIcon(status?.status || 'READY')}
                    {status?.status || 'PENDING'}
                  </div>
                  <CardTitle className="text-sm">
                    {truncateText(job.criteria.jobTitle, 20)} in {truncateText(job.criteria.location, 20)}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveJob(job.jobId)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <CardDescription className="text-xs">
                Keywords: {truncateText(job.criteria.keywords, 30)} • Target: {job.criteria.numberOfLeads} leads
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {status && (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{status.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          status.status === 'SUCCEEDED' ? 'bg-green-500' :
                          status.status === 'FAILED' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-xs">
                    <div className="flex gap-4">
                      <span>Leads found: <strong>{status.estimatedLeads}</strong></span>
                      <span>Duration: <strong>{formatDuration(status.duration)}</strong></span>
                    </div>
                    {status.finishedAt && (
                      <span className="text-muted-foreground">
                        Completed {new Date(status.finishedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* Results Actions */}
                  {status.status === 'SUCCEEDED' && status.estimatedLeads > 0 && onRetrieveResults && !status.resultsRetrieved && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => onRetrieveResults(job.jobId)}
                        className="text-xs"
                      >
                        Retrieve Results ({status.estimatedLeads} leads)
                      </Button>
                    </div>
                  )}
                  
                  {/* Results Retrieved Indicator */}
                  {status.status === 'SUCCEEDED' && status.resultsRetrieved && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Results retrieved and saved to leads database</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
