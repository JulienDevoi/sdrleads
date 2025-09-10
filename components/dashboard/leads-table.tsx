'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Filter, CheckCircle, Star, Linkedin, ExternalLink, ChevronDown, X, Search, UserX, XCircle, MapPin, MoreHorizontal, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lead } from '@/types'
import { getInitials, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface LeadsTableProps {
  leads: Lead[]
  onLeadUpdate?: (leadId: string, newStatus: 'sourced' | 'verified' | 'enriched' | 'rejected') => void
  onLeadDelete?: (leadId: string) => void
}

const statusColors = {
  sourced: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  enriched: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels = {
  sourced: 'Sourced',
  verified: 'Verified',
  enriched: 'Enriched',
  rejected: 'Rejected',
}

export function LeadsTable({ leads, onLeadUpdate, onLeadDelete }: LeadsTableProps) {
  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [updatingLeads, setUpdatingLeads] = useState<Set<string>>(new Set())
  const [sendingToLemlist, setSendingToLemlist] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'sourced' | 'verified' | 'enriched' | 'rejected'>('all')
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all')
  const [sprintFilter, setSprintFilter] = useState<'all' | 'empty' | string>('all')
  const [removingDuplicates, setRemovingDuplicates] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
  
  const itemsPerPage = 50
  
  // Get unique countries from leads data
  const availableCountries = Array.from(new Set(leads.map(lead => lead.country).filter(Boolean))).sort()
  
  // Get unique sprints from leads data
  const availableSprints = Array.from(new Set(leads.map(lead => lead.sprint).filter(Boolean))).sort()
  
  // Apply filters
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesCountry = countryFilter === 'all' || lead.country === countryFilter
    const matchesSprint = sprintFilter === 'all' || 
                         (sprintFilter === 'empty' && (!lead.sprint || lead.sprint.trim() === '')) ||
                         lead.sprint === sprintFilter
    return matchesStatus && matchesCountry && matchesSprint
  })
  
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLeads = filteredLeads.slice(startIndex, endIndex)
  
  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const toggleDropdown = (leadId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.clear() // Close other dropdowns
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const closeDropdown = (leadId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(leadId)
      return newSet
    })
  }

  const handleFindEmail = (leadId: string) => {
    closeDropdown(leadId)
    setShowComingSoonModal(true)
  }

  const handleStatusUpdate = async (leadId: string, newStatus: 'verified' | 'enriched') => {
    setUpdatingLeads(prev => {
      const newSet = new Set(prev)
      newSet.add(leadId)
      return newSet
    })
    
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onLeadUpdate?.(leadId, newStatus)
      } else {
        console.error('Failed to update lead status')
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }

  const handleRejectLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to reject this lead?')) {
      return
    }

    setUpdatingLeads(prev => {
      const newSet = new Set(prev)
      newSet.add(leadId)
      return newSet
    })
    
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (response.ok) {
        onLeadUpdate?.(leadId, 'rejected')
      } else {
        console.error('Failed to reject lead')
        alert('Failed to reject lead. Please try again.')
      }
    } catch (error) {
      console.error('Error rejecting lead:', error)
      alert('Error rejecting lead. Please try again.')
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }

  const handleSendToLemlist = async (leadId: string) => {
    closeDropdown(leadId) // Close dropdown when action is triggered
    setSendingToLemlist(prev => {
      const newSet = new Set(prev)
      newSet.add(leadId)
      return newSet
    })
    
    try {
      const response = await fetch(`/api/leads/${leadId}/send-to-lemlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        alert('Lead successfully sent to lemlist!')
      } else {
        console.error('Failed to send lead to lemlist:', result.error)
        alert(`Failed to send lead to lemlist: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending lead to lemlist:', error)
      alert('Error sending lead to lemlist. Please try again.')
    } finally {
      setSendingToLemlist(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }

  const handleRemoveDuplicates = async () => {
    setRemovingDuplicates(true)
    
    try {
      const response = await fetch('/api/leads/remove-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully removed ${result.duplicatesRemoved} duplicate leads!`)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        console.error('Failed to remove duplicates:', error)
        alert('Failed to remove duplicates. Please try again.')
      }
    } catch (error) {
      console.error('Error removing duplicates:', error)
      alert('Error removing duplicates. Please try again.')
    } finally {
      setRemovingDuplicates(false)
    }
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <CardDescription>Latest leads added to your database</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <UserX className="w-4 h-4 mr-2" />
              {removingDuplicates ? 'Removing...' : 'Remove duplicates'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value as any)
                  handleFilterChange()
                }}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="sourced">Sourced</option>
                <option value="verified">Verified</option>
                <option value="enriched">Enriched</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Country:</label>
              <select 
                value={countryFilter} 
                onChange={(e) => {
                  setCountryFilter(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value="all">All Countries</option>
                {availableCountries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Sprint:</label>
              <select 
                value={sprintFilter} 
                onChange={(e) => {
                  setSprintFilter(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value="all">All Sprints</option>
                <option value="empty">No Sprint</option>
                {availableSprints.map(sprint => (
                  <option key={sprint} value={sprint}>
                    {sprint}
                  </option>
                ))}
              </select>
            </div>
            
            {(statusFilter !== 'all' || countryFilter !== 'all' || sprintFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setCountryFilter('all')
                  setSprintFilter('all')
                  handleFilterChange()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground ml-auto">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {currentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {lead.photo_url ? (
                        <Image 
                          src={lead.photo_url} 
                          alt={lead.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 ${lead.photo_url ? 'hidden' : ''}`}>
                        <span className="text-sm font-medium text-primary">
                          {getInitials(lead.name || 'Unknown')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{lead.name || 'Unknown'}</span>
                          {lead.linkedin_url && (
                            <a 
                              href={lead.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {lead.title && (
                          <div className="text-sm text-muted-foreground" title={lead.title}>
                            {truncateText(lead.title, 25)}
                          </div>
                        )}
                        {(lead.city || lead.country) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span title={lead.city && lead.country 
                              ? `${lead.city}, ${lead.country}`
                              : lead.city || lead.country}>
                              {truncateText(
                                lead.city && lead.country 
                                  ? `${lead.city}, ${lead.country}`
                                  : lead.city || lead.country,
                                20
                              )}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground" title={lead.email}>
                          {truncateText(lead.email || 'No email', 20)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {lead.organizationLogoUrl ? (
                        <Image 
                          src={lead.organizationLogoUrl} 
                          alt={`${lead.company} logo`}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded mr-3 object-contain bg-gray-50"
                          onError={(e) => {
                            // Fallback to company initials if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 bg-muted/50 rounded flex items-center justify-center mr-3 text-xs font-medium ${lead.organizationLogoUrl ? 'hidden' : ''}`}>
                        {getInitials(lead.company || 'Unknown')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" title={lead.company}>
                            {truncateText(lead.company, 20)}
                          </span>
                          {lead.organizationWebsiteUrl && (
                            <a 
                              href={lead.organizationWebsiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Visit company website"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {lead.organizationLinkedinUrl && (
                            <a 
                              href={lead.organizationLinkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View company LinkedIn"
                            >
                              <Linkedin className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground" title={lead.industry}>
                          {truncateText(lead.industry || 'Unknown', 15)}
                        </div>
                        {lead.organizationEstimatedNumEmployees && (
                          <div className="text-sm text-muted-foreground">
                            {lead.organizationEstimatedNumEmployees.toLocaleString()} employees
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        statusColors[lead.status]
                      )}
                    >
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {lead.status === 'sourced' ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={updatingLeads.has(lead.id)}
                            onClick={() => handleStatusUpdate(lead.id, 'verified')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {updatingLeads.has(lead.id) ? 'Verifying...' : 'Verify'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={updatingLeads.has(lead.id)}
                            onClick={() => handleRejectLead(lead.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {updatingLeads.has(lead.id) ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      ) : lead.status === 'verified' ? (
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            onClick={() => toggleDropdown(lead.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          
                          {openDropdowns.has(lead.id) && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => closeDropdown(lead.id)}
                              />
                              <div className="absolute right-0 top-8 z-20 w-80 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                {!lead.email && (
                                  <button
                                    onClick={() => handleFindEmail(lead.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Find email
                                  </button>
                                )}
                                {!lead.sentToLemlist && (
                                  <button
                                    onClick={() => handleSendToLemlist(lead.id)}
                                    disabled={sendingToLemlist.has(lead.id)}
                                    className="w-full text-left px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 flex items-start disabled:opacity-50"
                                  >
                                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span className="leading-tight break-words">
                                      {sendingToLemlist.has(lead.id) ? 'Sending...' : 'Send to Web3 Finance Club (lemlist)'}
                                    </span>
                                  </button>
                                )}
                                {lead.sentToLemlist && (
                                  <div className="px-4 py-3 text-sm text-purple-600 flex items-start">
                                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-tight break-words">
                                      Sent to Web3 Finance Club
                                    </span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      
                      ) : lead.status === 'enriched' ? (
                        <span className="text-sm text-muted-foreground">Complete</span>
                      ) : lead.status === 'rejected' ? (
                        <span className="text-sm text-muted-foreground">Rejected</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, leads.length)} of {leads.length} results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
{(() => {
                const maxVisiblePages = 7
                const pages = []
                
                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className="w-8 h-8 p-0"
                      >
                        {i}
                      </Button>
                    )
                  }
                } else {
                  // Always show first page
                  pages.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      className="w-8 h-8 p-0"
                    >
                      1
                    </Button>
                  )
                  
                  // Show ellipsis if needed
                  if (currentPage > 4) {
                    pages.push(<span key="ellipsis1" className="px-2">...</span>)
                  }
                  
                  // Show pages around current page
                  const start = Math.max(2, currentPage - 1)
                  const end = Math.min(totalPages - 1, currentPage + 1)
                  
                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className="w-8 h-8 p-0"
                      >
                        {i}
                      </Button>
                    )
                  }
                  
                  // Show ellipsis if needed
                  if (currentPage < totalPages - 3) {
                    pages.push(<span key="ellipsis2" className="px-2">...</span>)
                  }
                  
                  // Always show last page
                  if (totalPages > 1) {
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    )
                  }
                }
                
                return pages
              })()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Coming Soon Modal */}
    {showComingSoonModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl border max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Email Feature
            </h3>
            <p className="text-gray-600 mb-6">
              This feature is coming soon! We&apos;re working on integrating email finding capabilities to help you discover contact information for your leads.
            </p>
            <Button
              onClick={() => setShowComingSoonModal(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
