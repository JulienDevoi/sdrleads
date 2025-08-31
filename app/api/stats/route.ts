import { NextResponse } from 'next/server'
import { mockStats } from '@/lib/mock-data'

export async function GET() {
  try {
    // In a real app, this would calculate stats from your database
    return NextResponse.json(mockStats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
