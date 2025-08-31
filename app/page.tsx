'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Target } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { Lead, DashboardStats } from '@/types'

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    revenue: 0,
    growthMetrics: {
      totalLeadsGrowth: 0,
      qualifiedLeadsGrowth: 0,
      conversionRateGrowth: 0,
      revenueGrowth: 0,
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leads and stats in parallel
        const [leadsResponse, statsResponse] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/stats')
        ])

        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json()
          setLeads(leadsData)
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening with your leads."
        />
        
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Leads"
                value={stats.totalLeads.toLocaleString()}
                change={stats.growthMetrics.totalLeadsGrowth}
                icon={<Users className="w-6 h-6 text-white" />}
                iconColor="bg-blue-500"
              />
              <StatsCard
                title="Verified Leads"
                value={stats.qualifiedLeads.toLocaleString()}
                change={stats.growthMetrics.qualifiedLeadsGrowth}
                icon={<Target className="w-6 h-6 text-white" />}
                iconColor="bg-green-500"
              />
              <StatsCard
                title="Enrichment Rate"
                value={`${stats.conversionRate}%`}
                change={stats.growthMetrics.conversionRateGrowth}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                iconColor="bg-purple-500"
              />
            </div>
          )}

          {/* Recent Leads Table */}
          {loading ? (
            <div className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <LeadsTable leads={leads} />
          )}

          {/* Additional Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">New lead from Acme Corp added</p>
                  <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm">Demo scheduled with StartupXYZ</p>
                  <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm">Contract signed with Enterprise Inc</p>
                  <span className="text-xs text-muted-foreground ml-auto">3h ago</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Pipeline Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sourced</span>
                  <span className="font-medium">{leads.filter(l => l.status === 'sourced').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <span className="font-medium">{leads.filter(l => l.status === 'verified').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Enriched</span>
                  <span className="font-medium">{leads.filter(l => l.status === 'enriched').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Leads</span>
                  <span className="font-medium">{stats.totalLeads}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}