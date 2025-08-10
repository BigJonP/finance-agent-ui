// Authentication utilities for JWT management
import { userApi } from './api'

export interface User {
  id: string
  username: string
  email: string
  created_at?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Check if user is authenticated by verifying JWT token
export const checkAuthStatus = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('finance_agent_jwt')
  if (!token) return false
  
  try {
    // Basic JWT expiration check
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// Get current user from localStorage (for backward compatibility)
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const userId = localStorage.getItem('userId')
  const username = localStorage.getItem('username')
  const email = localStorage.getItem('email')
  
  if (userId && username && email) {
    return {
      id: userId,
      username,
      email,
    }
  }
  
  return null
}

// Sign out user and clear all authentication data
export const signOut = (): void => {
  userApi.signOut()
  
  // Clear localStorage for backward compatibility
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
  }
}

// Validate and store user data after successful authentication
export const storeUserData = (user: User): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('userId', user.id)
  localStorage.setItem('username', user.username)
  localStorage.setItem('email', user.email)
}
