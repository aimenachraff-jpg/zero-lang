import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { createServerSupabaseClient, syncLearnerMetadata } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your ZERO-LANG account and learner profile.',
}

export const dynamic = 'force-dynamic'

const languageNames: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese', tr: 'Turkish', ru: 'Russian', zh: 'Chinese',
}

const goalNames: Record<string, string> = {
  career_advancement: 'Career advancement',
  academic_study: 'Academic study',
  migration_visa: 'Migration / visa',
  exam_preparation: 'Exam preparation',
  personal_growth: 'Personal growth',
  social_integration: 'Social integration',
}

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?redirect=%2Fprofile')

  await syncLearnerMetadata(user)

  const [profileRes, learnerRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('learner_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_progress').select('status, score').eq('user_id', user.id),
  ])

  const profile = profileRes.data as any
  const learner = learnerRes.data as any
  const progress = (progressRes.data ?? []) as any[]
  const completed = progress.filter((p) => p.status === 'completed' || p.status === 'mastered').length

  const name = profile?.full_name || user.email?.split('@')[0] || 'Learner'
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('')

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {initials}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <p className="text-sm text-muted-foreground break-all">{profile?.email ?? user.email}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Learner profile</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Native language</dt>
                <dd className="font-medium">{profile?.native_language ? (languageNames[profile.native_language] ?? profile.native_language) : 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Goal</dt>
                <dd className="font-medium">{learner?.primary_goal ? (goalNames[learner.primary_goal] ?? learner.primary_goal) : 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current level</dt>
                <dd className="font-medium">{learner?.current_level ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Target level</dt>
                <dd className="font-medium">{learner?.target_level ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lessons completed</span>
                <Badge variant="outline">{completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Placement check</span>
                <Badge variant={learner?.placement_completed ? 'success' : 'outline'}>
                  {learner?.placement_completed ? 'Completed' : 'Not completed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account email</span>
                <Badge variant={user.email_confirmed_at ? 'success' : 'warning'}>
                  {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/progress" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            View progress
          </Link>
          <Link href="/curriculum" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Browse curriculum
          </Link>
          <Link href="/placement" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent">
            {learner?.placement_completed ? 'Retake placement' : 'Take placement'}
          </Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
