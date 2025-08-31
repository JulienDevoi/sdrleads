import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const leadId = params.id

    if (!status || !['sourced', 'verified', 'enriched'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedLead = await LeadsService.updateLead(leadId, { status })
    
    if (!updatedLead) {
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('API Error - PATCH /api/leads/[id]:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    const success = await LeadsService.deleteLead(leadId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('API Error - DELETE /api/leads/[id]:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
