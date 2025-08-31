import { Users, CheckCircle, Clock, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Lead } from '@/types'

interface LeadsStatsProps {
  leads: Lead[]
}

export function LeadsStats({ leads }: LeadsStatsProps) {
  const stats = {
    total: leads.length,
    sourced: leads.filter(lead => lead.status === 'sourced').length,
    verified: leads.filter(lead => lead.status === 'verified').length,
    enriched: leads.filter(lead => lead.status === 'enriched').length,
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.total,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      iconColor: 'bg-blue-100',
      color: 'text-blue-600'
    },
    {
      title: 'Sourced',
      value: stats.sourced,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      iconColor: 'bg-yellow-100',
      color: 'text-yellow-600'
    },
    {
      title: 'Verified',
      value: stats.verified,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      iconColor: 'bg-green-100',
      color: 'text-green-600'
    },
    {
      title: 'Enriched',
      value: stats.enriched,
      icon: <Star className="w-5 h-5 text-purple-600" />,
      iconColor: 'bg-purple-100',
      color: 'text-purple-600'
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
