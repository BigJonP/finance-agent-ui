'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HoldingsTable } from '@/components/holdings-table'
import { AddHoldingForm } from '@/components/add-holding-form'
import { AdviceCard } from '@/components/advice-card'
import { getCurrentUser, signOut, checkAuthStatus } from '@/lib/auth'
import { type User as UserType } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)

  useEffect(() => {
    // Check JWT authentication status first
    if (!checkAuthStatus()) {
      router.push('/')
      return
    }
    
    // Get user data from localStorage (for backward compatibility)
    const user = getCurrentUser()
    if (user) {
      setUserId(user.id)
      setCurrentUser(user)
    } else {
      // If no user data, redirect to home for authentication
      router.push('/')
    }
  }, [router])

  const handleSignOut = () => {
    // Use the auth utility to sign out
    signOut()
    
    setUserId('')
    setCurrentUser(null)
    router.push('/')
  }

  if (!userId || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser.username}!</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AddHoldingForm userId={userId} />
          <HoldingsTable userId={userId} />
        </div>
        
        <div>
          <AdviceCard userId={userId} />
        </div>
      </div>
    </div>
  )
}