'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { LeadsStats } from '@/components/leads/leads-stats'
import { Lead } from '@/types'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        const data = await response.json()
        setLeads(data)
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

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
          <LeadsStats leads={leads} />
          
          {/* Leads Table */}
          <LeadsTable leads={leads} />
        </main>
      </div>
    </div>
  )
}
