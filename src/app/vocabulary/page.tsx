import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { VocabularyBrowser } from '@/components/vocabulary/vocabulary-browser'
import { getPublishedUnits, getVocabulary } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Vocabulary Bank',
  description:
    'Search 245 advanced English terms drawn from the ZERO-LANG curriculum, with definitions, examples and CEFR levels.',
}

export const dynamic = 'force-dynamic'

export default async function VocabularyPage() {
  const [entries, units] = await Promise.all([getVocabulary(), getPublishedUnits()])
  const unitOptions = units.map((unit) => ({
    slug: unit.slug,
    title: unit.title,
    level: unit.level,
  }))

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Badge variant="info" className="mb-4 text-sm">
            {entries.length} terms · definitions and examples
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            The <span className="text-primary">Vocabulary Bank</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every key term from every lesson, in one searchable place. Search by word or definition,
            filter by CEFR level, or jump to the unit where the term is taught.
          </p>
        </div>

        <VocabularyBrowser entries={entries} units={unitOptions} />

        <div className="mt-14 rounded-xl border bg-muted/30 p-6 text-center md:p-8">
          <h2 className="text-xl font-semibold">Learn the terms in context</h2>
          <p className="mx-auto mt-2 max-w-2xl leading-relaxed text-muted-foreground">
            A definition is a start, not an education. Each term below appears inside a long-form
            lesson where you can see how it works in an argument — and then use it in a graded
            exercise.
          </p>
          <a
            href="/curriculum"
            className="mt-5 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse the curriculum
          </a>
        </div>
      </div>
    </main>
  )
}
