import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  iconColor: string
}

export function StatsCard({ title, value, change, icon, iconColor }: StatsCardProps) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <div className="flex items-center space-x-1">
              {change !== 0 && (
                <>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isPositive && 'text-green-600',
                      isNegative && 'text-red-600'
                    )}
                  >
                    {isPositive ? '+' : ''}{change}%
                  </span>
                </>
              )}
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
