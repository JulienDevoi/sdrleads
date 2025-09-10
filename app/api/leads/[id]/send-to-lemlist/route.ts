import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    // Get the lead from database
    const lead = await LeadsService.getLeadById(leadId)
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check if lead is verified
    if (lead.status !== 'verified') {
      return NextResponse.json(
        { error: 'Lead must be verified before sending to lemlist' },
        { status: 400 }
      )
    }

    // Check if lead has already been sent to lemlist
    if (lead.sentToLemlist) {
      return NextResponse.json(
        { error: 'Lead has already been sent to lemlist' },
        { status: 400 }
      )
    }

    // Parse first and last name from full name
    const nameParts = lead.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    // Prepare data to send to lemlist webhook
    const lemlistData = {
      id: lead.id,
      name: lead.name,
      firstName: firstName,
      lastName: lastName,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      industry: lead.industry,
      country: lead.country,
      city: lead.city,
      linkedin_url: lead.linkedin_url,
      photo_url: lead.photo_url,
      organizationWebsiteUrl: lead.organizationWebsiteUrl,
      organizationLinkedinUrl: lead.organizationLinkedinUrl,
      organizationEstimatedNumEmployees: lead.organizationEstimatedNumEmployees,
      status: lead.status,
      source: lead.source,
      createdAt: lead.createdAt,
      sentToLemlistAt: new Date().toISOString()
    }

    // Send to lemlist webhook
    const webhookUrl = 'https://notanothermarketer.app.n8n.cloud/webhook-test/b9cf7744-2e2a-4e1f-b157-51ee3fc75dfe'
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lemlistData)
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Lemlist webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to send lead to lemlist' },
        { status: 500 }
      )
    }

    // Update lead to mark it as sent to lemlist
    const updatedLead = await LeadsService.updateLead(leadId, { 
      sentToLemlist: true,
      sentToLemlistAt: new Date(),
      notes: lead.notes ? `${lead.notes}\n\nSent to lemlist on ${new Date().toISOString()}` : `Sent to lemlist on ${new Date().toISOString()}`
    })

    if (!updatedLead) {
      console.error('Failed to update lead after sending to lemlist')
    }

    return NextResponse.json({
      success: true,
      message: 'Lead successfully sent to lemlist',
      lead: updatedLead || lead
    })

  } catch (error) {
    console.error('API Error - POST /api/leads/[id]/send-to-lemlist:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send lead to lemlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
