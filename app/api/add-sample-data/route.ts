import { NextResponse } from 'next/server'
import { LeadsService } from '@/lib/leads-service'

const sampleLeads = [
  {
    name: 'John Smith',
    email: 'john@acmecorp.com',
    company: 'Acme Corp',
    industry: 'Technology',
    status: 'sourced' as const,
    source: 'website' as const,

    notes: 'Initial contact made through website form.'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@techstartup.io',
    company: 'Tech Startup',
    industry: 'SaaS',
    status: 'verified' as const,
    source: 'linkedin' as const,

    notes: 'Verified contact information and company details.'
  },
  {
    name: 'Mike Chen',
    email: 'mike@enterprise.com',
    company: 'Enterprise Inc',
    industry: 'Manufacturing',
    status: 'enriched' as const,
    source: 'referral' as const,

    notes: 'Fully enriched profile with complete company data.'
  },
  {
    name: 'Lisa Rodriguez',
    email: 'lisa@consulting.co',
    company: 'Consulting Co',
    industry: 'Consulting',
    status: 'verified' as const,
    source: 'cold-call' as const,

    notes: 'Contact verified through phone call.'
  },
  {
    name: 'David Wilson',
    email: 'david@startup.com',
    company: 'Startup Inc',
    industry: 'Technology',
    status: 'sourced' as const,
    source: 'email' as const,

    notes: 'Lead sourced from email campaign.'
  }
]

export async function POST() {
  try {
    console.log('Adding sample data...')
    
    const results = []
    
    for (const leadData of sampleLeads) {
      const newLead = await LeadsService.createLead(leadData)
      if (newLead) {
        results.push(newLead)
      }
    }

    console.log(`Successfully added ${results.length} sample leads`)

    return NextResponse.json({
      success: true,
      message: `Added ${results.length} sample leads`,
      leads: results
    })

  } catch (error) {
    console.error('Error adding sample data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add sample data',
      details: error
    }, { status: 500 })
  }
}
