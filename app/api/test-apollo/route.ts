import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apifyToken = process.env.APIFY_API_TOKEN
  
  return NextResponse.json({
    tokenExists: !!apifyToken,
    tokenLength: apifyToken?.length || 0,
    tokenPreview: apifyToken ? `${apifyToken.substring(0, 8)}...` : 'No token',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
