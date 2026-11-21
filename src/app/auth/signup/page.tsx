'use client'

import * as React from 'react'
import { useState } from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { signUp, signInWithOAuth } from '@/lib/supabase'

const languages: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'pt', label: 'Portuguese (Português)' },
  { value: 'zh', label: 'Chinese (中文)' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'ko', label: 'Korean (한국어)' },
  { value: 'ru', label: 'Russian (Русский)' },
  { value: 'it', label: 'Italian (Italiano)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'other', label: 'Other' },
]

const goals: SelectOption[] = [
  { value: 'career_advancement', label: 'Career advancement' },
  { value: 'academic_study', label: 'Academic study / research' },
  { value: 'migration_visa', label: 'Migration / visa requirements' },
  { value: 'exam_preparation', label: 'Exam preparation (IELTS, TOEFL, Cambridge)' },
  { value: 'personal_growth', label: 'Personal growth / intellectual curiosity' },
  { value: 'social_integration', label: 'Social / cultural integration' },
  { value: 'other', label: 'Other' },
]

export const dynamic = 'force-dynamic'

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/progress'
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    nativeLanguage: 'en',
    learningGoal: 'personal_growth',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain an uppercase letter'
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Password must contain a lowercase letter'
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain a number'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        native_language: formData.nativeLanguage,
        learning_goal: formData.learningGoal,
      })
      if (error) {
        toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Account created!', description: 'Check your email to confirm your account' })
        router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        toast({ title: 'OAuth failed', description: error.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6" aria-label="ZERO-LANG Home">
            <svg className="h-10 w-10 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" className="fill-primary" />
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">ZERO-LANG</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Free. Open source. No tracking. Join 1,000+ advanced learners.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>We only ask for what we need to personalize your learning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  error={errors.fullName}
                  placeholder="Alex Chen"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  error={errors.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="nativeLanguage">Native Language</Label>
                <Select
                  value={formData.nativeLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                  options={languages}
                  placeholder="Select your native language"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="learningGoal">Primary Learning Goal</Label>
                <Select
                  value={formData.learningGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, learningGoal: e.target.value }))}
                  options={goals}
                  placeholder="What's your main goal?"
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuth('github')}
                disabled={isLoading}
                className="gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                className="gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
          <p>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
          <p>
            Already have an account?{' '}
            <Link href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  )
}