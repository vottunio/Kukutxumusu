import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessDeniedProps {
  message?: string
}

export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800">
                {message || 'You do not have permission to access this page. Only authorized administrators can view this content.'}
              </p>
              <p className="text-sm text-red-600 mt-4">
                If you believe this is an error, please contact the system administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
