'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, LogIn, UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { userApi, type User as UserType } from '@/lib/api'

export default function ProfilePage() {
  const [mode, setMode] = useState<'signin' | 'create'>('signin')
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const storedUsername = localStorage.getItem('username')
    const storedEmail = localStorage.getItem('email')
    
    if (storedUserId && storedUsername && storedEmail) {
      setCurrentUser({
        id: storedUserId,
        username: storedUsername,
        email: storedEmail,
      })
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: (data: UserType) => {
      localStorage.setItem('userId', data.id)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      setCurrentUser(data)
      // Clear form
      setName('')
      setEmail('')
      setPassword('')
    },
  })

  const signInMutation = useMutation({
    mutationFn: userApi.signIn,
    onSuccess: (data: { user: UserType; access_token: string; refresh_token: string; token_type: string }) => {
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('email', data.user.email)
      setCurrentUser(data.user)
      // Clear form
      setUsername('')
      setPassword('')
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return

    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    })
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    signInMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    })
  }

  const handleSignOut = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    setCurrentUser(null)
    // Clear forms
    setName('')
    setEmail('')
    setUsername('')
    setPassword('')
  }

  const isLoading = createMutation.isPending || signInMutation.isPending
  const error = createMutation.error || signInMutation.error

  // If user is signed in, show profile info
  if (currentUser) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {currentUser.username}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Username:</strong> {currentUser.username}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {currentUser.email}
              </p>
              <p className="text-sm">
                <strong>User ID:</strong> {currentUser.id}
              </p>
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authentication forms
  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mode Toggle */}
      <div className="flex border rounded-lg p-1 bg-muted">
        <Button
          variant={mode === 'signin' ? 'default' : 'ghost'}
          onClick={() => setMode('signin')}
          className="flex-1"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
        <Button
          variant={mode === 'create' ? 'default' : 'ghost'}
          onClick={() => setMode('create')}
          className="flex-1"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'signin' ? (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-username">Username</Label>
                <Input
                  id="signin-username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full"
              >
                {signInMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Username</Label>
                <Input
                  id="create-name"
                  placeholder="Enter your username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !name.trim() ||
                  !email.trim() ||
                  !password.trim()
                }
                className="w-full"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}