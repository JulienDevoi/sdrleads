import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface RetrieveResultsRequest {
  jobId: string
  datasetId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, datasetId }: RetrieveResultsRequest = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const apifyToken = process.env.APIFY_API_TOKEN
    if (!apifyToken) {
      return NextResponse.json(
        { error: 'Apify API token not configured' },
        { status: 500 }
      )
    }

    // Get job info from database
    const { data: job, error: jobError } = await supabaseAdmin
      .from('sourcing_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Use provided datasetId or get from job record
    const targetDatasetId = datasetId || job.dataset_id

    if (!targetDatasetId) {
      return NextResponse.json(
        { error: 'No dataset ID available for this job' },
        { status: 400 }
      )
    }

    // Fetch results from Apify dataset
    const datasetUrl = `https://api.apify.com/v2/datasets/${targetDatasetId}/items?token=${apifyToken}&clean=true&format=json`
    
    console.log('Fetching results from:', datasetUrl)

    const datasetResponse = await fetch(datasetUrl)
    
    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text()
      console.error('Apify dataset error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch results from Apify' },
        { status: 500 }
      )
    }

    const leads = await datasetResponse.json()

    if (!Array.isArray(leads)) {
      return NextResponse.json(
        { error: 'Invalid dataset format' },
        { status: 500 }
      )
    }

    console.log(`Retrieved ${leads.length} leads from dataset`)

    // Helper function to generate category based on job criteria
    const generateCategory = (jobTitle: string, keywords: string, location: string) => {
      const title = jobTitle.toLowerCase()
      const keys = keywords ? keywords.toLowerCase() : ''
      
      // Technology/Software categories
      if (title.includes('engineer') || title.includes('developer') || title.includes('tech') || keys.includes('saas') || keys.includes('software')) {
        return 'Technology & Software'
      }
      
      // Executive/Leadership categories
      if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') || title.includes('president') || title.includes('founder')) {
        return 'Executive Leadership'
      }
      
      // Marketing/Sales categories
      if (title.includes('marketing') || title.includes('sales') || title.includes('business development')) {
        return 'Marketing & Sales'
      }
      
      // Finance categories
      if (title.includes('finance') || title.includes('accounting') || title.includes('controller')) {
        return 'Finance & Accounting'
      }
      
      // Operations categories
      if (title.includes('operations') || title.includes('manager') || title.includes('director')) {
        return 'Operations & Management'
      }
      
      // Industry-specific categories based on keywords
      if (keys.includes('healthcare') || keys.includes('medical')) {
        return 'Healthcare'
      }
      
      if (keys.includes('fintech') || keys.includes('financial')) {
        return 'Financial Services'
      }
      
      if (keys.includes('crypto') || keys.includes('blockchain') || keys.includes('web3')) {
        return 'Crypto & Blockchain'
      }
      
      if (keys.includes('ecommerce') || keys.includes('retail')) {
        return 'E-commerce & Retail'
      }
      
      // Default category
      if (location) {
        return `${jobTitle} - ${location}`
      } else {
        return jobTitle
      }
    }

    // Transform Apollo leads to match your existing leads table structure
    const transformedLeads = leads.map(lead => ({
      // Basic info
      name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      first_name: lead.first_name || null,
      last_name: lead.last_name || null,
      email: lead.email,
      company: lead.organization_name || lead.organization?.name || '',
      industry: lead.industry || lead.organization?.industry || 'Unknown',
      headline: lead.headline || null,
      
      // Set status and source for Apollo sourced leads
      status: 'sourced' as const,
      source: 'Apollo' as const, // Sourced via Apollo AI Agent
      
      // Link to sourcing job
      sourcing_job_id: job.id,
      
      // Generate category based on job criteria
      category: generateCategory(job.job_title, job.keywords, job.location),
      
      // Optional fields that map to your schema
      rank: 'N/A', // Default rank, not mapped from Apollo data
      country: lead.country || null,
      city: lead.city || null,
      notes: `Sourced via Apollo AI Agent. Job ID: ${jobId}`,
      photo_url: lead.photo_url || null,
      linkedin_url: lead.linkedin_url || null,
      title: lead.title || null,
      
      // Organization fields
      organizationLogoUrl: lead.organization?.logo_url || null,
      organizationEstimatedNumEmployees: lead.estimated_num_employees || lead.organization?.estimated_num_employees || null,
      organizationWebsiteUrl: lead.organization_website_url || lead.organization?.website_url || null,
      organizationLinkedinUrl: lead.organization_linkedin_url || lead.organization?.linkedin_url || null
    }))

    // Store leads in your existing leads table
    const { data: storedLeads, error: storeError } = await supabaseAdmin
      .from('leads')
      .insert(transformedLeads)
      .select()

    if (storeError) {
      console.error('Error storing leads:', storeError)
      return NextResponse.json(
        { error: 'Failed to store leads in database' },
        { status: 500 }
      )
    }

    // Update job with results retrieved flag
    await supabaseAdmin
      .from('sourcing_jobs')
      .update({ 
        updated_at: new Date().toISOString(),
        leads_found: leads.length,
        results_retrieved: true
      })
      .eq('id', job.id)

    return NextResponse.json({
      success: true,
      message: `Successfully retrieved and stored ${leads.length} leads`,
      leadsCount: leads.length,
      jobId: jobId,
      datasetId: targetDatasetId,
      storedLeads: storedLeads?.length || 0
    })

  } catch (error) {
    console.error('Error in results retrieval API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
