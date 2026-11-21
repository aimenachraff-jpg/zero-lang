import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createServerSupabaseClient, syncLearnerMetadata } from '@/lib/supabase-server'
import { getPublishedUnits } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Progress Tracking',
  description: 'Real, evidence-based progress from the lessons you complete.',
}

export const dynamic = 'force-dynamic'

const languageNames: Record<string, string> = { ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German' }
const goalNames: Record<string, string> = {
  career_advancement: 'Career advancement',
  academic_study: 'Academic study',
  migration_visa: 'Migration / visa',
  exam_preparation: 'Exam preparation',
  personal_growth: 'Personal growth',
  social_integration: 'Social integration',
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function ProgressPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?redirect=%2Fprogress')

  await syncLearnerMetadata(user)

  const [profileRes, learnerRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('learner_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('user_progress')
      .select('*, units(title, slug, level), lessons(title)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ])

  const profile = profileRes.data as any
  const learner = learnerRes.data as any
  const progress = (progressRes.data ?? []) as any[]
  const units = await getPublishedUnits()

  const completed = progress.filter((p) => p.status === 'completed' || p.status === 'mastered')
  const scored = progress.filter((p) => typeof p.score === 'number')
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, p) => sum + Number(p.score), 0) / scored.length)
    : null
  const attempts = progress.reduce((sum, p) => sum + (Number(p.attempts) || 0), 0)
  const inProgressUnits = new Set(progress.filter((p) => p.status === 'in_progress').map((p) => p.unit_id)).size

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Progress Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                {profile?.full_name ? `Welcome back, ${profile.full_name}. ` : ''}
                Every number below comes from your saved lesson results.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-primary">{learner?.current_level ?? '—'}</p>
              </div>
              <div className="w-px h-9 bg-border" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold">{learner?.target_level ?? '—'}</p>
              </div>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: 'Lessons completed', value: String(completed.length) },
              { label: 'Average score', value: averageScore === null ? '—' : `${averageScore}%` },
              { label: 'Units in progress', value: String(inProgressUnits) },
              { label: 'Total attempts', value: String(attempts) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">Your units</h2>
                {units.length === 0 ? (
                  <p className="text-muted-foreground">No published content yet.</p>
                ) : (
                  <div className="space-y-3">
                    {units.map((unit) => {
                      const unitProgress = progress.filter((p) => p.unit_id === unit.id)
                      const unitCompleted = unitProgress.filter((p) => p.status === 'completed' || p.status === 'mastered').length
                      const total = unit.lessons?.length ?? 0
                      const percent = total ? Math.round((unitCompleted / total) * 100) : 0
                      return (
                        <div key={unit.id} className="rounded-xl border bg-card p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div>
                              <Link href={`/curriculum/${unit.slug}`} className="font-semibold hover:text-primary">
                                {unit.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">{unitCompleted} of {total} lessons completed</p>
                            </div>
                            <Badge variant={percent === 100 ? 'success' : percent > 0 ? 'info' : 'outline'}>
                              {percent === 100 ? 'Complete' : percent > 0 ? 'In progress' : 'Not started'}
                            </Badge>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Recent activity</h2>
                {progress.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="text-muted-foreground mb-4">You haven&apos;t completed a lesson yet.</p>
                    <Link href="/curriculum">
                      <Button>Browse the curriculum</Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {progress.slice(0, 8).map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{item.lessons?.title ?? item.units?.title ?? 'Lesson'}</p>
                          <p className="text-xs text-muted-foreground">{item.units?.title ?? ''} · {item.status.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {typeof item.score === 'number' && <Badge variant="outline">{item.score}%</Badge>}
                          <span className="text-xs text-muted-foreground">{relativeTime(item.updated_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-4">Learner profile</h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{profile?.full_name ?? 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium break-all">{profile?.email ?? user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Native language</dt>
                    <dd className="font-medium">
                      {profile?.native_language ? (languageNames[profile.native_language] ?? profile.native_language) : 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Goal</dt>
                    <dd className="font-medium">{learner?.primary_goal ? (goalNames[learner.primary_goal] ?? learner.primary_goal) : 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Placement check</dt>
                    <dd className="font-medium">{learner?.placement_completed ? 'Completed' : 'Not completed'}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border bg-muted/30 p-5">
                <h2 className="font-semibold mb-2">How this works</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scores here are written by the lesson grader straight into your Supabase progress table. No demo numbers, no streaks — just the work you did.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
