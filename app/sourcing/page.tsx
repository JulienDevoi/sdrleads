'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { AIAgentCard } from '@/components/sourcing/ai-agent-card'
import { ManualLeadCard } from '@/components/sourcing/manual-lead-card'
import { LinkedInPostCard } from '@/components/sourcing/linkedin-post-card'
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

  const handleLeadAdded = (linkedinUrl: string) => {
    console.log('Manual lead added:', linkedinUrl)
    // TODO: Add any additional logic for handling manual lead addition
  }

  const handlePostProcessed = (postUrl: string) => {
    console.log('LinkedIn post processed:', postUrl)
    // TODO: Add any additional logic for handling post processing
  }

  const handleRemoveJob = (jobId: string) => {
    setActiveJobs(prev => prev.filter(job => job.jobId !== jobId))
  }

  const handleRetrieveResults = async (jobId: string) => {
    try {
      const response = await fetch('/api/apollo-scraper/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Successfully retrieved ${result.leadsCount} leads!\n\nLeads have been stored in the database and are ready for integration.`)
      } else {
        alert(`Error retrieving results: ${result.error}`)
      }
    } catch (error) {
      console.error('Error retrieving results:', error)
      alert('Failed to retrieve results. Please try again.')
    }
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
              <ManualLeadCard onLeadAdded={handleLeadAdded} />
              <LinkedInPostCard onPostProcessed={handlePostProcessed} />
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
                onRetrieveResults={handleRetrieveResults}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
