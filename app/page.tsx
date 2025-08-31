'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { LeadsStats } from '@/components/leads/leads-stats'
import { Lead } from '@/types'

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const handleLeadUpdate = (leadId: string, newStatus: 'sourced' | 'verified' | 'enriched') => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    )
  }

  const handleLeadDelete = (leadId: string) => {
    setLeads(prevLeads => 
      prevLeads.filter(lead => lead.id !== leadId)
    )
  }

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
          <LeadsTable leads={leads} onLeadUpdate={handleLeadUpdate} onLeadDelete={handleLeadDelete} />
        </main>
      </div>
    </div>
  )
}