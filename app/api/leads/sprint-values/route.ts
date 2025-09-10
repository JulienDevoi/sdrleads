import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Fetching unique sprint values...')
    
    // Get all distinct sprint values from the database
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('Sprint')
      .not('Sprint', 'is', null)
    
    if (error) {
      console.error('Error fetching sprint values:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sprint values', details: error.message },
        { status: 500 }
      )
    }

    // Get unique sprint values and filter out empty strings
    const uniqueSprints = Array.from(new Set(
      data
        .map(item => item.Sprint)
        .filter(sprint => sprint && sprint.trim() !== '')
    )).sort()

    console.log('Found unique sprint values:', uniqueSprints)

    return NextResponse.json({
      success: true,
      sprints: uniqueSprints
    })

  } catch (error) {
    console.error('API Error - GET /api/leads/sprint-values:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sprint values',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
