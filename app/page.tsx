export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Lead Gen CRM</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <p className="text-gray-600">Welcome to your CRM dashboard!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Leads</h3>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Qualified</h3>
            <p className="text-2xl font-bold text-green-600">342</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900">Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">$52.4K</p>
          </div>
        </div>
      </div>
    </div>
  )
}