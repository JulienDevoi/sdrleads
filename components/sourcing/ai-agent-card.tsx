'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LeadSourcingFormData {
  jobTitle: string
  keywords: string
  location: string
  numberOfLeads: number
}

interface SourcingJob {
  jobId: string
  criteria: LeadSourcingFormData
  startTime: string
}

interface AIAgentCardProps {
  onJobCreated: (job: SourcingJob) => void
}

export function AIAgentCard({ onJobCreated }: AIAgentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<LeadSourcingFormData>({
    jobTitle: '',
    keywords: '',
    location: '',
    numberOfLeads: 500
  })

  const handleInputChange = (field: keyof LeadSourcingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      console.log('Starting Apollo lead sourcing with:', formData)
      
      // Call the Apollo scraper API
      const response = await fetch('/api/apollo-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Apollo scraping job started successfully:', result)
        
        // Create job object for tracking
        const newJob: SourcingJob = {
          jobId: result.jobId,
          criteria: { ...formData },
          startTime: new Date().toISOString()
        }
        
        // Notify parent component
        onJobCreated(newJob)
        
        alert(`Lead sourcing started! Job ID: ${result.jobId}\nSearching for ${formData.numberOfLeads} leads...`)
      } else {
        console.error('Error starting Apollo scraping:', result)
        alert(`Error: ${result.error}\nDetails: ${result.details || 'No additional details'}\nStatus: ${result.status || 'Unknown'}`)
      }

    } catch (error) {
      console.error('Error calling Apollo scraper API:', error)
      alert('Failed to start lead sourcing. Please try again.')
    }

    setIsDialogOpen(false)
    // Reset form
    setFormData({
      jobTitle: '',
      keywords: '',
      location: '',
      numberOfLeads: 500
    })
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/20"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto p-2">
            <Image
              src="/apollo.png"
              alt="Apollo AI"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-xl">Apollo AI Agent</CardTitle>
          <CardDescription>
            Source leads from Apollo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Highly targeted leads</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Customized research</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Real-time results</span>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            Start Sourcing
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Source leads from Apollo</DialogTitle>
            <DialogDescription>
              Configure your lead sourcing criteria. Our AI Agent will find and qualify prospects that match your requirements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                placeholder="e.g., Marketing Manager, CEO, Sales Director"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="keywords" className="text-sm font-medium text-foreground">
                Keywords <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="keywords"
                type="text"
                placeholder="e.g., SaaS, B2B, Enterprise, Technology (optional)"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., San Francisco, New York, Remote (optional)"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="numberOfLeads" className="text-sm font-medium text-foreground">
                Number of Leads
              </label>
              <select
                id="numberOfLeads"
                value={formData.numberOfLeads}
                onChange={(e) => handleInputChange('numberOfLeads', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
              >
                <option value={500}>500 leads</option>
                <option value={1000}>1,000 leads</option>
                <option value={1500}>1,500 leads</option>
                <option value={2000}>2,000 leads</option>
                <option value={2500}>2,500 leads</option>
                <option value={5000}>5,000 leads</option>
                <option value={10000}>10,000 leads</option>
              </select>
            </div>
          </div>

          <DialogFooter className="px-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.jobTitle.trim() || !formData.numberOfLeads}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Start Sourcing New Leads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
