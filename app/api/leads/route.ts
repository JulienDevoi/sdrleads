import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

export async function GET() {
  try {
    const leads = await LeadsService.getAllLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error('API Error - GET /api/leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newLead = await LeadsService.createLead(body)
    
    if (!newLead) {
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error('API Error - POST /api/leads:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
