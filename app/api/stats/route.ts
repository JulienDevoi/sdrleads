import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

export async function GET() {
  try {
    const stats = await LeadsService.getLeadsStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('API Error - GET /api/stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
