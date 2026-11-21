import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { LessonPlayer } from '@/components/curriculum/lesson-player'
import { getPublishedUnitBySlug } from '@/lib/content'
import { lessonWordCount, readingMinutes } from '@/lib/lesson-utils'

export const dynamic = 'force-dynamic'

type Props = {
  params: { slug: string }
  searchParams: { lesson?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await getPublishedUnitBySlug(params.slug)
  if (!unit) return { title: 'Unit Not Found' }
  return { title: `${unit.title} — ${unit.level}`, description: unit.subtitle ?? undefined }
}

const topicIcons: Record<string, string> = {
  artificial_intelligence: '🤖',
  climate_change: '🌍',
  philosophy: '🤔',
  economics: '📈',
}

export default async function UnitPage({ params, searchParams }: Props) {
  const unit = await getPublishedUnitBySlug(params.slug)
  if (!unit) notFound()

  if (unit.lessons.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link href="/curriculum" className="text-sm text-muted-foreground hover:text-foreground">← Curriculum</Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">{unit.title}</h1>
          <p className="text-muted-foreground">This unit has no lessons yet.</p>
        </div>
      </main>
    )
  }

  const requestedOrder = Number(searchParams.lesson)
  const lesson = unit.lessons.find((l) => l.order === requestedOrder) ?? unit.lessons[0]
  const currentIndex = unit.lessons.findIndex((l) => l.id === lesson.id)
  const nextLesson = unit.lessons[currentIndex + 1] ?? null
  const icon = topicIcons[unit.topic] ?? '📚'
  const totalWords = unit.lessons.reduce((sum, item) => sum + lessonWordCount(item), 0)
  const currentWords = lessonWordCount(lesson)
  const currentMinutes = readingMinutes(currentWords)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <Link href="/curriculum" className="text-muted-foreground hover:text-foreground">← Curriculum</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{unit.title}</span>
          </div>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl" aria-hidden="true">{icon}</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{unit.title}</h1>
            </div>
            {unit.subtitle && <p className="text-lg text-muted-foreground mb-4">{unit.subtitle}</p>}
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{unit.level}</Badge>
              <Badge variant="outline">{unit.lessons.length} lessons</Badge>
              <Badge variant="outline">{totalWords.toLocaleString()} words</Badge>
              <Badge variant="outline">~{unit.estimated_hours ?? 0}h</Badge>
            </div>
            {unit.description && <p className="mt-4 max-w-3xl text-foreground/80 leading-relaxed">{unit.description}</p>}
          </header>

          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside>
              <div className="lg:sticky lg:top-6 rounded-xl border bg-card p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Lessons
                </h2>
                <nav aria-label="Unit lessons" className="space-y-1">
                  {unit.lessons.map((item) => {
                    const active = item.id === lesson.id
                    return (
                      <Link
                        key={item.id}
                        href={`/curriculum/${unit.slug}?lesson=${item.order}`}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          active ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="mr-2 opacity-70">{item.order}.</span>
                        {item.title}
                        <span className="mt-1 block text-xs opacity-70">
                          {lessonWordCount(item).toLocaleString()} words · {readingMinutes(lessonWordCount(item))} min
                        </span>
                      </Link>
                    )
                  })}
                </nav>

                {unit.learning_outcomes && unit.learning_outcomes.length > 0 && (
                  <div className="mt-6 pt-5 border-t">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                      Outcomes
                    </h2>
                    <ul className="space-y-2">
                      {unit.learning_outcomes.map((outcome, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary">→</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>

            <article className="min-w-0">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Lesson {lesson.order}</span>
                  <span>·</span>
                  <span className="capitalize">{lesson.type.replace(/_/g, ' ')}</span>
                  <span>·</span>
                  <span>{currentWords.toLocaleString()} words</span>
                  <span>·</span>
                  <span>~{currentMinutes} min reading</span>
                  <span>·</span>
                  <span>{lesson.estimated_minutes ?? 0} min total</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">{lesson.title}</h2>
                {lesson.objectives && lesson.objectives.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    {lesson.objectives.map((objective, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {objective}</li>
                    ))}
                  </ul>
                )}
              </div>

              <LessonPlayer
                unitId={unit.id}
                unitSlug={unit.slug}
                lesson={lesson}
                nextLesson={nextLesson ? { order: nextLesson.order, title: nextLesson.title } : null}
              />
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}
