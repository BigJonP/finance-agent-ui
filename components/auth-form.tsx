'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { userApi, type User as UserType } from '@/lib/api'
import { storeUserData } from '@/lib/auth'

interface AuthFormProps {
  onSuccess: (user: UserType) => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'create'>('signin')
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: async (data: UserType) => {
      try {
        const signInResponse = await userApi.signIn({
          username: data.username,
          password: password,
        });
        
        storeUserData(signInResponse.user);
        onSuccess(signInResponse.user);
        
        setName('');
        setEmail('');
        setPassword('');
        
        router.push('/dashboard');
      } catch (signInError) {
        console.warn('Auto-signin failed after account creation:', signInError);
        storeUserData(data);
        onSuccess(data);
        
        setName('');
        setEmail('');
        setPassword('');
        
        router.push('/dashboard');
      }
    },
  })

  const signInMutation = useMutation({
    mutationFn: userApi.signIn,
    onSuccess: (data: { user: UserType; access_token: string; refresh_token: string; token_type: string }) => {
      // Store user info using auth utilities
      storeUserData(data.user)
      onSuccess(data.user)
      setUsername('')
      setPassword('')
      router.push('/dashboard')
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return

    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
    })
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    signInMutation.mutate({
      username: username.trim(),
      password,
    })
  }

  const isLoading = createMutation.isPending || signInMutation.isPending
  const error = createMutation.error || signInMutation.error

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
                Sign In to Finance Agent
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Your Account
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
