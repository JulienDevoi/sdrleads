import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('Connection successful. Total leads:', count)

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      totalLeads: count,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    })

  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error
    }, { status: 500 })
  }
}
