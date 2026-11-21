import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { UnitCard } from '@/components/curriculum/unit-card'
import { getPublishedUnits } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Curriculum',
  description: 'Browse real ZERO-LANG units: structured B2–C2 English lessons taught through world knowledge.',
}

export const dynamic = 'force-dynamic'

const topicNames: Record<string, string> = {
  artificial_intelligence: 'Artificial Intelligence',
  climate_change: 'Climate Change',
  philosophy: 'Philosophy',
  economics: 'Economics',
  science_technology: 'Science & Medicine',
  media_information: 'Media & Information',
}

export default async function CurriculumPage() {
  const units = await getPublishedUnits()

  const topicCounts = new Map<string, number>()
  for (const unit of units) {
    topicCounts.set(unit.topic, (topicCounts.get(unit.topic) ?? 0) + 1)
  }
  const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length ?? 0), 0)
  const totalWords = units.reduce((sum, unit) => sum + (unit.metadata?.word_count ?? 0), 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="info" className="mb-4 text-sm">
            {units.length} units · {totalLessons} lessons · {totalWords.toLocaleString()} words
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Structured Curriculum for <span className="text-primary">Advanced English</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every unit below is real content stored in the database, with readings, graded exercises and progress tracking — not mock data.
          </p>
        </div>

        {units.length === 0 ? (
          <div className="max-w-xl mx-auto text-center p-10 rounded-xl border bg-muted/30">
            <h2 className="text-xl font-semibold mb-2">No published units yet</h2>
            <p className="text-muted-foreground mb-4">
              Run <code className="px-2 py-1 rounded bg-muted">node scripts/seed.mjs</code> to load the starter content.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap gap-2 justify-center">
              {Array.from(topicCounts.entries()).map(([topic, count]) => (
                <span key={topic} className="px-4 py-2 rounded-lg border bg-background text-sm font-medium">
                  {topicNames[topic] ?? topic} <span className="text-muted-foreground ml-1">({count})</span>
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={{
                    id: unit.id,
                    slug: unit.slug,
                    title: unit.title,
                    subtitle: unit.subtitle ?? '',
                    topic: unit.topic,
                    level: unit.level as 'B2' | 'C1' | 'C2',
                    order: unit.order,
                    estimatedHours: unit.estimated_hours ?? 0,
                    lessons: unit.lessons?.length ?? 0,
                    wordCount: unit.metadata?.word_count ?? 0,
                    readingMinutes: unit.metadata?.reading_minutes ?? 0,
                    outcomes: unit.learning_outcomes ?? [],
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <Link href="/vocabulary" className="font-medium text-primary hover:underline">
            Browse the full vocabulary bank →
          </Link>
          <Link href="/placement" className="font-medium text-primary hover:underline">
            Not sure where to start? Take the placement check →
          </Link>
        </div>
      </div>
    </main>
  )
}
