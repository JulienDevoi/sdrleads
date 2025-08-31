import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function SourcingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <Header 
          title="Sourcing" 
          subtitle="Find and source new leads for your pipeline" 
        />
        
        <main className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Lead Sourcing Tools
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Advanced lead sourcing and prospecting tools will be available here soon. 
              Stay tuned for powerful features to grow your pipeline.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
              🚀 Coming Soon
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
