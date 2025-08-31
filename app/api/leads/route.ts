import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

export async function GET() {
  try {
    console.log('Fetching leads from database...')
    const leads = await LeadsService.getAllLeads()
    console.log(`Found ${leads.length} leads`)
    return NextResponse.json(leads)
  } catch (error) {
    console.error('API Error - GET /api/leads:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
