import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { EnhancedLeadsTable } from '@/components/leads/enhanced-leads-table'
import { LeadsStats } from '@/components/leads/leads-stats'
import { mockLeads } from '@/lib/mock-data'

export default function LeadsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <Header 
          title="Leads" 
          subtitle="Manage and track all your leads" 
        />
        
        <main className="p-4 sm:p-6 space-y-6">
          {/* Quick Stats */}
          <LeadsStats leads={mockLeads} />
          
          {/* Enhanced Leads Table */}
          <EnhancedLeadsTable leads={mockLeads} />
        </main>
      </div>
    </div>
  )
}
