import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== TESTING ADMIN VS REGULAR CLIENT ===')
    
    // Test regular client
    const { data: regularData, error: regularError } = await supabase
      .from('leads')
      .select('id')
    
    console.log('Regular client:', regularData?.length, 'Error:', regularError)

    // Test admin client
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('leads')
      .select('id')
    
    console.log('Admin client:', adminData?.length, 'Error:', adminError)

    // Test if service role key is loaded
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('Service role key loaded:', serviceRoleKey ? 'YES' : 'NO')
    console.log('Service role key starts with:', serviceRoleKey?.substring(0, 20) + '...')

    return NextResponse.json({
      regularClient: regularData?.length || 0,
      adminClient: adminData?.length || 0,
      serviceRoleKeyLoaded: !!serviceRoleKey,
      regularError: regularError?.message,
      adminError: adminError?.message,
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
