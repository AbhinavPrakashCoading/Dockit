'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, Chrome, Mail, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      
      if (result?.error) {
        setError('Failed to sign in with Google. Please try again.')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Credentials sign-in error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <CardHeader className="space-y-1 text-center p-0 mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-lg border border-slate-200">
              <img src="/logo.svg" alt="Dockit" className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-medium text-slate-900">
            Welcome to Dockit
          </CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to access your document intelligence platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign-in Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-sm font-medium bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5 text-red-500" />
            )}
            Continue with Google
          </Button>

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

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 h-12 bg-white border-2 border-slate-300 focus:border-violet-600 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <a href="/auth/forgot-password" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 h-12 bg-white border-2 border-slate-300 focus:border-violet-600 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className={cn(
                "w-full h-12 text-sm font-medium text-white transition-all duration-200",
                "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg shadow-violet-500/30 hover:shadow-lg"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
