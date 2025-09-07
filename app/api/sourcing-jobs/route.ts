import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('sourcing_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5) // Limit to last 5 jobs for better performance

    if (error) {
      console.error('Error fetching sourcing jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sourcing jobs' },
        { status: 500 }
      )
    }

    // Transform database format to UI format
    const transformedJobs = jobs.map(job => ({
      jobId: job.job_id,
      criteria: {
        jobTitle: job.job_title,
        keywords: job.keywords,
        location: job.location,
        numberOfLeads: job.number_of_leads
      },
      startTime: job.created_at,
      status: {
        jobId: job.job_id,
        status: job.status,
        startedAt: job.started_at,
        finishedAt: job.finished_at,
        duration: job.duration_ms || 0,
        progress: getProgressFromStatus(job.status),
        estimatedLeads: job.leads_found || 0,
        stats: {},
        defaultDatasetId: job.dataset_id,
        resultsRetrieved: job.results_retrieved || false
      }
    }))

    return NextResponse.json({
      success: true,
      jobs: transformedJobs
    })

  } catch (error) {
    console.error('Error in sourcing jobs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getProgressFromStatus(status: string): number {
  switch (status) {
    case 'PENDING':
    case 'READY':
      return 0
    case 'RUNNING':
      return 50
    case 'SUCCEEDED':
      return 100
    case 'FAILED':
    case 'TIMED-OUT':
    case 'ABORTED':
      return 100
    default:
      return 0
  }
}
