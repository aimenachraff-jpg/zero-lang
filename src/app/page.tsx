import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPublishedUnits, getVocabulary } from '@/lib/content'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const features = [
  {
    title: 'Long-Form Lessons',
    description:
      'Every lesson is a real reading: three substantial passages, a full glossary and six graded questions. No filler, no three-sentence “articles”.',
    icon: '📖',
  },
  {
    title: 'A Searchable Word Bank',
    description:
      'Hundreds of advanced terms with definitions and example sentences, filterable by CEFR level and unit. The vocabulary is drawn from the readings, not a random list.',
    icon: '🔤',
  },
  {
    title: 'Graded, Not Gamified',
    description:
      'Multiple-choice and gap-fill exercises are marked instantly, with explanations. Your score and time on task are saved to your Supabase progress record.',
    icon: '✅',
  },
  {
    title: 'Reading Controls That Respect You',
    description:
      'Three text sizes, a serif toggle and a live reading-progress bar. If the default is too small, make it bigger — the setting is remembered.',
    icon: '🔎',
  },
  {
    title: 'B2–C2 World Knowledge',
    description:
      'Climate policy, AI architecture, moral philosophy, inequality, medicine and media. You learn the language by thinking about something that matters.',
    icon: '🌍',
  },
  {
    title: 'Free & Open Source',
    description:
      'MIT licensed. No ads, no tracking, no dark patterns. Your progress lives in your own Supabase project. The content is in the repository.',
    icon: '🔓',
  },
]

const topicIcons: Record<string, string> = {
  climate_change: '🌍',
  artificial_intelligence: '🤖',
  philosophy: '🤔',
  economics: '📈',
  science_technology: '🔬',
  media_information: '📡',
}

const levelVariant = (level: string): 'destructive' | 'warning' | 'info' =>
  level === 'C2' ? 'destructive' : level === 'C1' ? 'warning' : 'info'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [units, vocabulary] = await Promise.all([getPublishedUnits(), getVocabulary()])
  const lessonCount = units.reduce((sum, unit) => sum + (unit.lessons?.length ?? 0), 0)
  const wordCount = units.reduce((sum, unit) => sum + (unit.metadata?.word_count ?? 0), 0)

  const stats = [
    { value: units.length, label: 'units' },
    { value: lessonCount, label: 'lessons' },
    { value: wordCount.toLocaleString(), label: 'words of reading' },
    { value: vocabulary.length, label: 'vocabulary terms' },
  ]

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge variant="info" className="mb-6 text-sm">
              Open Source · Free Forever · B2–C2
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Advanced English{' '}
              <span className="text-primary">Through World Knowledge</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Read long-form lessons on climate, AI, philosophy, economics, medicine and media. Learn the
              vocabulary, answer graded questions, and watch your progress accumulate. No streaks. No
              cartoons. No AI tutor upsell.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/curriculum">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse the Library
                </Button>
              </Link>
            </div>
            {user ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Welcome back.{' '}
                <Link href="/progress" className="font-medium text-primary hover:underline">
                  View your progress
                </Link>
                {' '}or{' '}
                <Link href="/curriculum" className="font-medium text-primary hover:underline">
                  continue the curriculum
                </Link>
                .
              </p>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto mt-16 px-4">
          <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-background/80 p-5 text-center">
                <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="text-2xl font-bold tracking-tight md:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Built for Advanced Learners
            </h2>
            <p className="text-lg text-muted-foreground">
              Every feature serves B2–C2 progression. No beginner content diluted for advanced users.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 text-4xl" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real library */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">The Library</h2>
            <p className="text-lg text-muted-foreground">
              Every unit below is stored in the database, with lessons, glossaries and exercises you can
              open right now.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Link
                key={unit.id}
                href={`/curriculum/${unit.slug}`}
                className="group rounded-xl border bg-background p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {topicIcons[unit.topic] ?? '📚'}
                  </span>
                  <Badge variant={levelVariant(unit.level)}>{unit.level}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {unit.metadata?.word_count?.toLocaleString() ?? '—'} words
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">{unit.title}</h3>
                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {unit.subtitle}
                </p>
                <p className="text-sm font-medium text-primary">
                  {unit.lessons?.length ?? 0} lessons · {unit.metadata?.reading_minutes ?? '—'} min reading →
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/curriculum">
              <Button variant="outline" size="lg">
                View Full Curriculum →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">Four steps, no gimmicks.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: 'Take Placement',
                body: 'Nine CEFR-aligned questions across reading, grammar and vocabulary. Your result is saved to your learner profile.',
              },
              {
                title: 'Read Deeply',
                body: 'Open a unit and work through long-form passages with a glossary, reading timer and adjustable text size.',
              },
              {
                title: 'Answer and Submit',
                body: 'Graded multiple-choice and gap-fill questions with explanations. Your score is written straight to your progress table.',
              },
              {
                title: 'Track Real Progress',
                body: 'See completed lessons, average scores, attempts, time on task and recent activity — all from your own data.',
              },
            ].map((step, index) => (
              <div key={step.title} className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 text-primary-foreground md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Advance Your English?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            {wordCount.toLocaleString()} words of serious reading, {vocabulary.length} vocabulary terms, and
            a progress record that belongs to you. Free forever.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/placement">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              >
                Try Placement Check
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
