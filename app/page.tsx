'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'
import { type User as UserType } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure page is fully loaded before checking auth
    const checkAuth = () => {
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId) {
        // Redirect to dashboard if already authenticated
        router.push('/dashboard')
      } else {
        // Page is ready to show auth form
        setIsReady(true)
      }
    }
    
    // Use setTimeout to avoid blocking the initial render
    const timeoutId = setTimeout(checkAuth, 100)
    return () => clearTimeout(timeoutId)
  }, [router])

  const handleAuthSuccess = (user: UserType) => {
    // This will trigger the redirect in the AuthForm component
    console.log('Authentication successful for:', user.username)
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Finance Agent
        </h1>
        <p className="text-muted-foreground">
          Manage your portfolio and get AI-powered financial advice
        </p>
      </div>
      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  )
}
