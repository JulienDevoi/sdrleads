import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface ApolloScrapingRequest {
  jobTitle: string
  keywords: string
  location: string
  numberOfLeads: number
}

function constructApolloSearchUrl(jobTitle: string, keywords: string, location: string): string {
  const baseUrl = 'https://app.apollo.io/#/people'
  const params = new URLSearchParams({
    sortByField: 'recommendations_score',
    'contactEmailStatusV2[]': 'verified',
    sortAscending: 'false',
    contactEmailExcludeCatchAll: 'true'
  })

  // Add location if provided
  if (location.trim()) {
    params.append('personLocations[]', location)
  }

  // Add job title if provided
  if (jobTitle.trim()) {
    params.append('personTitles[]', jobTitle.toLowerCase())
  }

  // Add keywords to organization search if provided
  if (keywords.trim()) {
    // Split keywords by comma and add each as a separate parameter
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k)
    keywordList.forEach(keyword => {
      params.append('qOrganizationKeywordTags[]', keyword)
    })
  }

  return `${baseUrl}?${params.toString()}`
}

export async function POST(request: NextRequest) {
  try {
    const body: ApolloScrapingRequest = await request.json()
    const { jobTitle, keywords, location, numberOfLeads } = body

    // Validate required fields
    if (!jobTitle || !keywords || !location || !numberOfLeads) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, keywords, location, numberOfLeads' },
        { status: 400 }
      )
    }

    // Construct the Apollo search URL
    const searchUrl = constructApolloSearchUrl(jobTitle, keywords, location)
    
    console.log('Constructed Apollo Search URL:', searchUrl)

    // Prepare the API call to Apify Apollo scraper
    const apifyApiUrl = 'https://api.apify.com/v2/acts/code_crafter~apollo-io-scraper/runs'
    const apifyToken = process.env.APIFY_API_TOKEN

    console.log('Apify token exists:', !!apifyToken)
    console.log('Apify token length:', apifyToken?.length || 0)

    if (!apifyToken) {
      console.error('Apify API token not found in environment variables')
      return NextResponse.json(
        { error: 'Apify API token not configured' },
        { status: 500 }
      )
    }

    const apifyPayload = {
      getPersonalEmails: true,
      getWorkEmails: true,
      totalRecords: numberOfLeads,
      url: searchUrl,
      fileName: "Apollo Prospects",
      waitForFinish: false // Don't wait for completion, just start the run
    }

    console.log('Making API call to Apify with payload:', apifyPayload)

    // Make the API call to Apify
    const apifyResponse = await fetch(`${apifyApiUrl}?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyPayload)
    })

    console.log('Apify response status:', apifyResponse.status)

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('Apify API error status:', apifyResponse.status)
      console.error('Apify API error response:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to start Apollo scraping job',
          details: errorText,
          status: apifyResponse.status
        },
        { status: 500 }
      )
    }

    const apifyResult = await apifyResponse.json()
    
    console.log('Apollo scraping job started:', apifyResult)

    // Save job to database
    const jobData = {
      job_id: apifyResult.data?.id,
      job_title: jobTitle,
      keywords: keywords,
      location: location,
      number_of_leads: numberOfLeads,
      apollo_search_url: searchUrl,
      apify_payload: apifyPayload,
      status: 'PENDING',
      started_at: new Date().toISOString()
    }

    const { data: savedJob, error: dbError } = await supabaseAdmin
      .from('sourcing_jobs')
      .insert(jobData)
      .select()
      .single()

    if (dbError) {
      console.error('Error saving job to database:', dbError)
      // Don't fail the API call if DB save fails, just log it
    } else {
      console.log('Job saved to database:', savedJob)
    }

    return NextResponse.json({
      success: true,
      message: 'Apollo lead scraping job started successfully',
      jobId: apifyResult.data?.id,
      searchUrl: searchUrl,
      numberOfLeads: numberOfLeads,
      dbId: savedJob?.id
    })

  } catch (error) {
    console.error('Error in Apollo scraper API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
