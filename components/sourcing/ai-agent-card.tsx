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
  industry: string
  employeeRanges: string[]
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

// Apollo industry codes mapping
const APOLLO_INDUSTRIES = [
  { name: 'All Industries', code: '' },
  { name: 'Pharmaceuticals', code: '5567e0eb73696410e4bd1200' },
  { name: 'Technology', code: '5567cdbb7369640a984e5700' },
  { name: 'Healthcare', code: '5567cdbb7369640a984e5701' },
  { name: 'Financial Services', code: '5567cdbb7369640a984e5702' },
  { name: 'Manufacturing', code: '5567cdbb7369640a984e5703' },
  { name: 'Retail', code: '5567cdbb7369640a984e5704' },
  { name: 'Real Estate', code: '5567cdbb7369640a984e5705' },
  { name: 'Education', code: '5567cdbb7369640a984e5706' },
  { name: 'Consulting', code: '5567cdbb7369640a984e5707' },
  { name: 'Marketing & Advertising', code: '5567cdbb7369640a984e5708' },
  { name: 'Software', code: '5567cdbb7369640a984e5709' },
  { name: 'E-commerce', code: '5567cdbb7369640a984e570a' },
  { name: 'Automotive', code: '5567cdbb7369640a984e570b' },
  { name: 'Food & Beverage', code: '5567cdbb7369640a984e570c' },
  { name: 'Media & Entertainment', code: '5567cdbb7369640a984e570d' },
  { name: 'Non-profit', code: '5567cdbb7369640a984e570e' },
  { name: 'Government', code: '5567cdbb7369640a984e570f' },
  { name: 'Legal', code: '5567cdbb7369640a984e5710' },
  { name: 'Transportation', code: '5567cdbb7369640a984e5711' }
]

// Apollo employee ranges mapping
const APOLLO_EMPLOYEE_RANGES = [
  { label: '1-10', value: '1,10' },
  { label: '11-20', value: '11,20' },
  { label: '21-50', value: '21,50' },
  { label: '51-100', value: '51,100' },
  { label: '101-200', value: '101,200' },
  { label: '201-500', value: '201,500' },
  { label: '501-1000', value: '501,1000' },
  { label: '1001-2000', value: '1001,2000' },
  { label: '2001-5000', value: '2001,5000' },
  { label: '5001-10000', value: '5001,10000' },
  { label: '10001+', value: '10001,' }
]

export function AIAgentCard({ onJobCreated }: AIAgentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<LeadSourcingFormData>({
    jobTitle: '',
    keywords: '',
    location: '',
    industry: '',
    employeeRanges: [],
    numberOfLeads: 500
  })

  const handleInputChange = (field: keyof LeadSourcingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmployeeRangeChange = (rangeValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      employeeRanges: checked 
        ? [...prev.employeeRanges, rangeValue]
        : prev.employeeRanges.filter(range => range !== rangeValue)
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
      industry: '',
      employeeRanges: [],
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
              <label htmlFor="industry" className="text-sm font-medium text-foreground">
                Industry <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
              >
                {APOLLO_INDUSTRIES.map(industry => (
                  <option key={industry.code} value={industry.code}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Company Size <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-input rounded-md p-2">
                {APOLLO_EMPLOYEE_RANGES.map(range => (
                  <label key={range.value} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.employeeRanges.includes(range.value)}
                      onChange={(e) => handleEmployeeRangeChange(range.value, e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
                    />
                    <span>{range.label} employees</span>
                  </label>
                ))}
              </div>
              {formData.employeeRanges.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Selected: {formData.employeeRanges.length} range{formData.employeeRanges.length !== 1 ? 's' : ''}
                </div>
              )}
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
