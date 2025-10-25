'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/dashboard/Dashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [showSignup, setShowSignup] = useState(true)
  const [guestSession, setGuestSession] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    console.log('Dashboard page - session status:', status)
    console.log('Dashboard page - session data:', session)

    // Handle different session states
    if (status === 'authenticated') {
      // User is authenticated, hide signup after a short delay to show session creation
      const timer = setTimeout(() => {
        setShowSignup(false)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'unauthenticated') {
      // No session, keep showing signup for session creation
      setShowSignup(true)
    }
  }, [session, status])

  // Function to handle guest mode
  const handleGuestMode = () => {
    console.log('Starting guest session...')
    setGuestSession(true)
    // Simulate guest session creation
    const timer = setTimeout(() => {
      setShowSignup(false)
    }, 1500)
    return () => clearTimeout(timer)
  }

  // Show signup page during loading or for session creation
  if (status === 'loading' || showSignup) {
    return (
      <div className="min-h-screen">
        <SignUpPageWithGuestOption 
          onGuestMode={handleGuestMode}
          isLoading={status === 'loading'}
          isAuthenticated={status === 'authenticated'}
          guestSession={guestSession}
        />
      </div>
    )
  }

  return <Dashboard />
}

// Enhanced SignUp component with guest mode option
function SignUpPageWithGuestOption({ 
  onGuestMode, 
  isLoading, 
  isAuthenticated, 
  guestSession 
}: {
  onGuestMode: () => void
  isLoading: boolean
  isAuthenticated: boolean
  guestSession: boolean
}) {
  if (isAuthenticated && !guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-200">
            <img src="/logo.svg" alt="Dockit" className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-medium text-green-600 mb-2">Welcome Back!</h2>
          <p className="text-slate-600">Setting up your dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mt-4"></div>
        </div>
      </div>
    )
  }

  if (guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-200">
            <img src="/logo.svg" alt="Dockit" className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-medium text-purple-600 mb-2">Welcome, Guest!</h2>
          <p className="text-slate-600">Creating your temporary session...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mt-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <SessionCreationForm onSuccess={() => {}} />
      {/* Guest Mode Option Overlay */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={onGuestMode}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-slate-600"
        >
          <span className="flex items-center gap-2">
            <span>👋</span>
            <span className="font-medium">Continue as Guest</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// Session Creation Form Component
function SessionCreationForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-200">
              <img src="/logo.svg" alt="Dockit" className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-medium text-slate-900 mb-2">
              Welcome to Dockit
            </h1>
            <p className="text-slate-600">
              Choose how you'd like to get started with our document intelligence platform
            </p>
          </div>
          
          <SessionOptions onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  )
}

// Session Options Component
function SessionOptions({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="space-y-4">
      <AuthenticationOptions onSuccess={onSuccess} />
    </div>
  )
}

// Authentication Options Component  
function AuthenticationOptions({ onSuccess }: { onSuccess: () => void }): JSX.Element {
  const [showForm, setShowForm] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      const { signIn } = await import('next-auth/react')
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      
      if (result?.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }


  if (showForm) {
    const SignUpForm = require('@/app/auth/signup/page').default
    return <SignUpForm skipRedirectCheck={true} onSuccess={onSuccess} showHeader={false} showSignInLink={false} />
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-200 bg-red-700/80 px-4 py-2 rounded text-sm text-center max-w-xs mx-auto">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full h-12 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </>
        )}
      </button>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500 font-medium">
            Or continue with email
          </span>
        </div>
      </div>
      {/* Email Sign Up */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full h-12 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
        <span className="font-medium">Sign up with Email</span>
      </button>
      {/* Sign In Link */}
      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <a 
          href="/auth/signin" 
          className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
        >
          Sign in
        </a>
      </div>
    </div>
  )
}
