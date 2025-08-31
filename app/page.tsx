'use client'

import { Users, TrendingUp, DollarSign, Target } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { mockLeads, mockStats } from '@/lib/mock-data'

export default function HomePage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Leads"
              value={mockStats.totalLeads.toLocaleString()}
              change={mockStats.growthMetrics.totalLeadsGrowth}
              icon={<Users className="w-6 h-6 text-white" />}
              iconColor="bg-blue-500"
            />
            <StatsCard
              title="Qualified Leads"
              value={mockStats.qualifiedLeads.toLocaleString()}
              change={mockStats.growthMetrics.qualifiedLeadsGrowth}
              icon={<Target className="w-6 h-6 text-white" />}
              iconColor="bg-green-500"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${mockStats.conversionRate}%`}
              change={mockStats.growthMetrics.conversionRateGrowth}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              iconColor="bg-purple-500"
            />
            <StatsCard
              title="Revenue"
              value={`$${(mockStats.revenue / 1000).toFixed(1)}K`}
              change={mockStats.growthMetrics.revenueGrowth}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              iconColor="bg-orange-500"
            />
          </div>

          {/* Recent Leads Table */}
          <LeadsTable leads={mockLeads} />

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
                  <span className="text-sm text-muted-foreground">New Leads</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Qualified</span>
                  <span className="font-medium">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-medium">158</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Converted</span>
                  <span className="font-medium">89</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}