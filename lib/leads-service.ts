import { supabase } from './supabase'
import { Lead } from '@/types'

export class LeadsService {
  static async getAllLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
        throw error
      }

      // Transform the data to match our Lead interface
      return data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        industry: lead.industry || 'Unknown',
        status: lead.status,
        source: lead.source,
        phone: lead.phone,
        value: lead.value || 0,
        notes: lead.notes || '',
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at)
      }))
    } catch (error) {
      console.error('Error in getAllLeads:', error)
      return []
    }
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching lead:', error)
        return null
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        industry: data.industry || 'Unknown',
        status: data.status,
        source: data.source,
        phone: data.phone,
        value: data.value || 0,
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error in getLeadById:', error)
      return null
    }
  }

  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: leadData.name,
          email: leadData.email,
          company: leadData.company,
          industry: leadData.industry,
          status: leadData.status,
          source: leadData.source,
          phone: leadData.phone,
          value: leadData.value,
          notes: leadData.notes
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating lead:', error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        industry: data.industry || 'Unknown',
        status: data.status,
        source: data.source,
        phone: data.phone,
        value: data.value || 0,
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error in createLead:', error)
      return null
    }
  }

  static async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating lead:', error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        industry: data.industry || 'Unknown',
        status: data.status,
        source: data.source,
        phone: data.phone,
        value: data.value || 0,
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error in updateLead:', error)
      return null
    }
  }

  static async deleteLead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting lead:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteLead:', error)
      return false
    }
  }

  static async getLeadsStats() {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, value')

      if (error) {
        console.error('Error fetching leads stats:', error)
        throw error
      }

      const totalLeads = leads.length
      const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length
      const totalRevenue = leads
        .filter(lead => lead.status === 'converted')
        .reduce((sum, lead) => sum + (lead.value || 0), 0)

      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

      return {
        totalLeads,
        qualifiedLeads,
        conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
        revenue: totalRevenue,
        growthMetrics: {
          totalLeadsGrowth: 0, // You can calculate this based on historical data
          qualifiedLeadsGrowth: 0,
          conversionRateGrowth: 0,
          revenueGrowth: 0,
        }
      }
    } catch (error) {
      console.error('Error in getLeadsStats:', error)
      return {
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
      }
    }
  }
}
