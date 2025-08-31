import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Starting duplicate removal process...')

    // Get all leads from the database
    const { data: allLeads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('id, email, created_at')
      .order('created_at', { ascending: true }) // Older leads first

    console.log(`Fetched ${allLeads?.length || 0} leads from database`)

    if (fetchError) {
      console.error('Error fetching leads:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch leads', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!allLeads || allLeads.length === 0) {
      return NextResponse.json({
        success: true,
        duplicatesRemoved: 0,
        message: 'No leads found'
      })
    }

    // Find duplicates based on email address
    const emailMap = new Map<string, any[]>()
    
    allLeads.forEach(lead => {
      // Skip leads with null/undefined/empty emails
      if (!lead.email || typeof lead.email !== 'string') {
        console.log(`Skipping lead ${lead.id} - invalid email:`, lead.email)
        return
      }
      
      const email = lead.email.toLowerCase().trim()
      
      // Skip empty emails after trimming
      if (!email) {
        console.log(`Skipping lead ${lead.id} - empty email after trimming`)
        return
      }
      
      if (!emailMap.has(email)) {
        emailMap.set(email, [])
      }
      emailMap.get(email)!.push(lead)
    })

    console.log(`Processed ${emailMap.size} unique email addresses`)

    // Collect IDs of duplicates to remove (keep the oldest one)
    const duplicateIds: string[] = []
    let duplicatesRemoved = 0

    emailMap.forEach((leadsWithSameEmail, email) => {
      if (leadsWithSameEmail.length > 1) {
        // Keep the first one (oldest), mark others for deletion
        const toDelete = leadsWithSameEmail.slice(1)
        toDelete.forEach(lead => {
          duplicateIds.push(lead.id)
          duplicatesRemoved++
        })
        console.log(`Found ${leadsWithSameEmail.length} leads with email: ${email}, removing ${toDelete.length} duplicates`)
      }
    })

    console.log(`Found ${duplicateIds.length} duplicate leads to remove`)

    if (duplicateIds.length === 0) {
      return NextResponse.json({
        success: true,
        duplicatesRemoved: 0,
        message: 'No duplicates found'
      })
    }

    // Delete duplicates in batches (Supabase has limits)
    const batchSize = 100
    let totalDeleted = 0

    for (let i = 0; i < duplicateIds.length; i += batchSize) {
      const batch = duplicateIds.slice(i, i + batchSize)
      
      const { error: deleteError } = await supabaseAdmin
        .from('leads')
        .delete()
        .in('id', batch)

      if (deleteError) {
        console.error('Error deleting batch:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete duplicates', details: deleteError.message },
          { status: 500 }
        )
      }

      totalDeleted += batch.length
      console.log(`Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} duplicates`)
    }

    console.log(`Successfully removed ${totalDeleted} duplicate leads`)

    return NextResponse.json({
      success: true,
      duplicatesRemoved: totalDeleted,
      message: `Successfully removed ${totalDeleted} duplicate leads`
    })

  } catch (error) {
    console.error('Error in remove duplicates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
