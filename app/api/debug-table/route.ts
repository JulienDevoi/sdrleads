import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== DEBUG: Checking table with 1500 rows ===')
    
    // Try different approaches to see what's wrong
    
    // 1. Count total rows
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
    
    console.log('Row count:', count, 'Error:', countError)

    // 2. Try to get first row with specific columns
    const { data: firstRow, error: firstRowError } = await supabase
      .from('leads')
      .select('id, name, email, company, status')
      .limit(1)
    
    console.log('First row (specific cols):', firstRow, 'Error:', firstRowError)

    // 3. Try to get first row with all columns
    const { data: firstRowAll, error: firstRowAllError } = await supabase
      .from('leads')
      .select('*')
      .limit(1)
    
    console.log('First row (all cols):', firstRowAll, 'Error:', firstRowAllError)

    // 4. Try with supabaseAdmin (service role)
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .limit(1)
    
    console.log('Admin query:', adminData, 'Error:', adminError)

    return NextResponse.json({
      success: true,
      totalCount: count,
      countError,
      firstRowSpecific: firstRow,
      firstRowSpecificError: firstRowError,
      firstRowAll: firstRowAll,
      firstRowAllError: firstRowAllError,
      adminQuery: adminData,
      adminError,
      message: `Table has ${count} rows but queries return empty. This suggests RLS (Row Level Security) is blocking access.`
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
