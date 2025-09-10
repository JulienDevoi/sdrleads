'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ManualLeadCardProps {
  onLeadAdded?: (linkedinUrl: string) => void
}

export function ManualLeadCard({ onLeadAdded }: ManualLeadCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!linkedinUrl.trim()) return

    setIsSubmitting(true)
    
    try {
      // Determine webhook URL based on environment
      const isProduction = process.env.NODE_ENV === 'production'
      const webhookUrl = isProduction 
        ? (process.env.NEXT_PUBLIC_MANUAL_LEAD_WEBHOOK_PROD || 'https://notanothermarketer.app.n8n.cloud/webhook/65b075af-d2b1-4bf3-9e9f-a8099576b527')
        : (process.env.NEXT_PUBLIC_MANUAL_LEAD_WEBHOOK_TEST || 'https://notanothermarketer.app.n8n.cloud/webhook-test/65b075af-d2b1-4bf3-9e9f-a8099576b527')
      
      console.log('Sending LinkedIn URL to webhook:', linkedinUrl, 'Environment:', process.env.NODE_ENV)
      
      // Call the webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl: linkedinUrl.trim(),
          timestamp: new Date().toISOString(),
          source: 'manual-lead-entry'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Webhook response:', result)
        
        // Notify parent component
        onLeadAdded?.(linkedinUrl)
        
        alert('LinkedIn profile added successfully! The lead will be processed and added to your database.')
        
        setIsDialogOpen(false)
        setLinkedinUrl('')
      } else {
        const errorText = await response.text()
        console.error('Webhook error:', response.status, errorText)
        alert(`Failed to add lead. Server responded with status ${response.status}. Please try again.`)
      }
    } catch (error) {
      console.error('Error adding manual lead:', error)
      alert('Failed to add lead. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidLinkedInUrl = (url: string) => {
    return url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/20"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-xl">Manual Lead Entry</CardTitle>
          <CardDescription>
            Add leads directly from LinkedIn URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Direct LinkedIn import</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Instant processing</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Manual curation</span>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            Add Lead
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead from LinkedIn</DialogTitle>
            <DialogDescription>
              Paste a LinkedIn profile URL to add a lead directly to your database. Our system will extract and process the profile information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <label htmlFor="linkedinUrl" className="text-sm font-medium text-foreground">
                LinkedIn Profile URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/profile-name"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {linkedinUrl && !isValidLinkedInUrl(linkedinUrl) && (
                <p className="text-sm text-red-500">
                  Please enter a valid LinkedIn profile URL
                </p>
              )}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Copy the LinkedIn profile URL from your browser&apos;s address bar when viewing someone&apos;s profile.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!linkedinUrl.trim() || !isValidLinkedInUrl(linkedinUrl) || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isSubmitting ? 'Adding Lead...' : 'Add Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
