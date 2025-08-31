import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== TESTING DIFFERENT QUERY METHODS ===')
    
    // Method 1: Count only
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
    
    console.log('Method 1 - Count only:', count, 'Error:', countError)

    // Method 2: With limit 10000
    const { data: dataLimit, error: limitError } = await supabase
      .from('leads')
      .select('id')
      .limit(10000)
    
    console.log('Method 2 - With limit 10000:', dataLimit?.length, 'Error:', limitError)

    // Method 3: With range
    const { data: dataRange, error: rangeError } = await supabase
      .from('leads')
      .select('id')
      .range(0, 9999)
    
    console.log('Method 3 - With range 0-9999:', dataRange?.length, 'Error:', rangeError)

    // Method 4: No limit at all
    const { data: dataNoLimit, error: noLimitError } = await supabase
      .from('leads')
      .select('id')
    
    console.log('Method 4 - No limit:', dataNoLimit?.length, 'Error:', noLimitError)

    return NextResponse.json({
      totalCount: count,
      withLimit10000: dataLimit?.length || 0,
      withRange: dataRange?.length || 0,
      noLimit: dataNoLimit?.length || 0,
      message: 'Check terminal for detailed logs'
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
