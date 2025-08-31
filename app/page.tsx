import { Users, CheckCircle, Target, DollarSign } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { mockStats, mockLeads } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back, Julien" 
        />
        
        <main className="p-4 sm:p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Leads"
              value={mockStats.totalLeads.toLocaleString()}
              change={mockStats.growthMetrics.totalLeadsGrowth}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              iconColor="bg-blue-100"
            />
            <StatsCard
              title="Qualified Leads"
              value={mockStats.qualifiedLeads.toLocaleString()}
              change={mockStats.growthMetrics.qualifiedLeadsGrowth}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              iconColor="bg-green-100"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${mockStats.conversionRate}%`}
              change={mockStats.growthMetrics.conversionRateGrowth}
              icon={<Target className="w-6 h-6 text-yellow-600" />}
              iconColor="bg-yellow-100"
            />
            <StatsCard
              title="Revenue"
              value={formatCurrency(mockStats.revenue)}
              change={mockStats.growthMetrics.revenueGrowth}
              icon={<DollarSign className="w-6 h-6 text-purple-600" />}
              iconColor="bg-purple-100"
            />
          </div>

          {/* Recent Leads Table */}
          <LeadsTable leads={mockLeads} />
        </main>
      </div>
    </div>
  )
}
