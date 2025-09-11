import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

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

    // Get job status from Apify
    const statusUrl = `https://api.apify.com/v2/actor-runs/${jobId}?token=${apifyToken}`
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Apify status API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get job status' },
        { status: 500 }
      )
    }

    const statusData = await response.json()
    const run = statusData.data

    // Only log status changes to reduce noise
    // console.log('Apify run data:', JSON.stringify(run, null, 2))

    // Get leads count from multiple possible sources
    let leadsFound = 0
    if (run.stats) {
      leadsFound = run.stats.itemsOutputted || 
                   run.stats.requestsFinished || 
                   run.stats.pagesProcessed || 
                   0
    }

    // If job is completed, try to get count from dataset
    if (run.status === 'SUCCEEDED' && run.defaultDatasetId && leadsFound === 0) {
      try {
        const datasetUrl = `https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=${process.env.APIFY_API_TOKEN}&clean=true&format=json`
        const datasetResponse = await fetch(datasetUrl)
        if (datasetResponse.ok) {
          const datasetData = await datasetResponse.json()
          leadsFound = Array.isArray(datasetData) ? datasetData.length : 0
          // console.log('Got leads count from dataset:', leadsFound)
        }
      } catch (error) {
        console.error('Error fetching dataset count:', error)
      }
    }

    // Transform Apify status to our format
    const jobStatus = {
      jobId: run.id,
      status: run.status, // READY, RUNNING, SUCCEEDED, FAILED, TIMED-OUT, ABORTED
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      duration: run.finishedAt ? 
        new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime() : 
        Date.now() - new Date(run.startedAt).getTime(),
      stats: run.stats || {},
      defaultDatasetId: run.defaultDatasetId,
      // Add progress estimation based on status
      progress: getProgressFromStatus(run.status),
      estimatedLeads: leadsFound,
      resultsRetrieved: false // Will be updated from database
    }

    // Update job status in database
    const updateData = {
      status: run.status,
      started_at: run.startedAt,
      finished_at: run.finishedAt,
      duration_ms: jobStatus.duration,
      leads_found: leadsFound,
      dataset_id: run.defaultDatasetId,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('sourcing_jobs')
      .update(updateData)
      .eq('job_id', jobId)

    if (updateError) {
      console.error('Error updating job status in database:', updateError)
    }

    // Get the updated job info including results_retrieved flag
    const { data: updatedJob } = await supabaseAdmin
      .from('sourcing_jobs')
      .select('results_retrieved')
      .eq('job_id', jobId)
      .single()

    // Update the jobStatus with database info
    if (updatedJob) {
      jobStatus.resultsRetrieved = updatedJob.results_retrieved || false
    }

    return NextResponse.json({
      success: true,
      job: jobStatus
    })

  } catch (error) {
    console.error('Error checking job status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getProgressFromStatus(status: string): number {
  switch (status) {
    case 'READY':
      return 0
    case 'RUNNING':
      return 50 // We could make this more sophisticated later
    case 'SUCCEEDED':
      return 100
    case 'FAILED':
    case 'TIMED-OUT':
    case 'ABORTED':
      return 100 // Complete but with error
    default:
      return 0
  }
}
