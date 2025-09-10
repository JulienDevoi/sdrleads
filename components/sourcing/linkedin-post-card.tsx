'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LinkedInPostCardProps {
  onPostProcessed?: (postUrl: string) => void
}

export function LinkedInPostCard({ onPostProcessed }: LinkedInPostCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [postUrl, setPostUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!postUrl.trim()) return

    setIsSubmitting(true)
    
    try {
      // Determine webhook URL based on environment
      const isProduction = process.env.NODE_ENV === 'production'
      const webhookUrl = isProduction 
        ? 'https://notanothermarketer.app.n8n.cloud/webhook/4cbb3b09-41c3-4529-b3b8-cb3f6dee7789'
        : 'https://notanothermarketer.app.n8n.cloud/webhook-test/4cbb3b09-41c3-4529-b3b8-cb3f6dee7789'
      
      console.log('Sending LinkedIn post URL to webhook:', postUrl, 'Environment:', process.env.NODE_ENV)
      
      // Call the webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postUrl: postUrl.trim(),
          timestamp: new Date().toISOString(),
          source: 'linkedin-post-interactions'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Webhook response:', result)
        
        // Notify parent component
        onPostProcessed?.(postUrl)
        
        alert('LinkedIn post submitted successfully! We&apos;ll extract leads from the post interactions and add them to your database.')
        
        setIsDialogOpen(false)
        setPostUrl('')
      } else {
        const errorText = await response.text()
        console.error('Webhook error:', response.status, errorText)
        alert(`Failed to process LinkedIn post. Server responded with status ${response.status}. Please try again.`)
      }
    } catch (error) {
      console.error('Error processing LinkedIn post:', error)
      alert('Failed to process LinkedIn post. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidLinkedInPostUrl = (url: string) => {
    return url.includes('linkedin.com/posts/') || 
           url.includes('linkedin.com/feed/update/') ||
           (url.includes('linkedin.com') && url.includes('activity-'))
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/20"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4 mx-auto">
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
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <CardTitle className="text-xl">LinkedIn Post Interactions</CardTitle>
          <CardDescription>
            Extract leads from LinkedIn post engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Post engagement analysis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Interaction-based targeting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>High-intent prospects</span>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
            Extract Leads
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extract Leads from LinkedIn Post</DialogTitle>
            <DialogDescription>
              Paste a LinkedIn post URL to extract leads from users who liked, commented, or shared the post. We&apos;ll analyze the engagement to find potential prospects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <label htmlFor="postUrl" className="text-sm font-medium text-foreground">
                LinkedIn Post URL
              </label>
              <input
                id="postUrl"
                type="url"
                placeholder="https://www.linkedin.com/posts/username_activity-..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {postUrl && !isValidLinkedInPostUrl(postUrl) && (
                <p className="text-sm text-red-500">
                  Please enter a valid LinkedIn post URL
                </p>
              )}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Copy the LinkedIn post URL from your browser&apos;s address bar when viewing a post. We&apos;ll extract leads from people who engaged with the post.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!postUrl.trim() || !isValidLinkedInPostUrl(postUrl) || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              {isSubmitting ? 'Processing...' : 'Extract Leads'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
