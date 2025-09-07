export interface Lead {
  id: string
  name: string
  email: string
  company: string
  industry: string
  status: 'sourced' | 'verified' | 'enriched' | 'rejected'
  source: 'website' | 'linkedin' | 'referral' | 'cold-call' | 'email'
  rank?: string
  country?: string
  city?: string
  notes?: string
  photo_url?: string
  linkedin_url?: string
  title?: string
  organizationLogoUrl?: string
  organizationEstimatedNumEmployees?: number
  organizationWebsiteUrl?: string
  organizationLinkedinUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  revenue: number
  growthMetrics: {
    totalLeadsGrowth: number
    qualifiedLeadsGrowth: number
    conversionRateGrowth: number
    revenueGrowth: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}
