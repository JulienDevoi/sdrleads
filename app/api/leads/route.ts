import { NextResponse } from 'next/server'
import { mockLeads } from '@/lib/mock-data'

export async function GET() {
  try {
    // In a real app, this would fetch from your database
    return NextResponse.json(mockLeads)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // In a real app, this would save to your database
    const newLead = {
      id: String(mockLeads.length + 1),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
