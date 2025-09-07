'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { AIAgentCard } from '@/components/sourcing/ai-agent-card'
import { JobProgressTracker } from '@/components/sourcing/job-progress-tracker'

interface SourcingJob {
  jobId: string
  criteria: {
    jobTitle: string
    keywords: string
    location: string
    numberOfLeads: number
  }
  startTime: string
}

export default function SourcingPage() {
  const [activeJobs, setActiveJobs] = useState<SourcingJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load jobs from database on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/sourcing-jobs')
        const result = await response.json()
        
        if (response.ok && result.success) {
          setActiveJobs(result.jobs)
        } else {
          console.error('Failed to load jobs:', result.error)
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [])

  const handleJobCreated = (job: SourcingJob) => {
    setActiveJobs(prev => [job, ...prev])
  }

  const handleRemoveJob = (jobId: string) => {
    setActiveJobs(prev => prev.filter(job => job.jobId !== jobId))
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <Header 
          title="Sourcing" 
          subtitle="Find and source new leads for your pipeline" 
        />
        
        <main className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Sourcing Tools Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AIAgentCard onJobCreated={handleJobCreated} />
              
              {/* Placeholder for future sourcing tools */}
              <div className="col-span-full md:col-span-1 lg:col-span-2">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center border-2 border-dashed border-muted rounded-lg">
                  <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    More Tools Coming Soon
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Additional lead sourcing and prospecting tools will be available here.
                  </p>
                </div>
              </div>
            </div>

            {/* Job Progress Tracking Section */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading jobs...</span>
              </div>
            ) : (
              <JobProgressTracker 
                jobs={activeJobs} 
                onRemoveJob={handleRemoveJob}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
