'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Activity, Lesson } from '@/lib/content-types'
import { lessonWordCount, passageText, readingMinutes } from '@/lib/lesson-utils'
import { getBrowserSupabaseClient, upsertUserProgress } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Props = {
  unitId: string
  unitSlug: string
  lesson: Lesson
  nextLesson: { order: number; title: string } | null
}

type ReadingSize = 'comfortable' | 'large' | 'xlarge'

const sizeClasses: Record<ReadingSize, string> = {
  comfortable: 'text-lg md:text-xl leading-[1.9]',
  large: 'text-xl md:text-2xl leading-[1.85]',
  xlarge: 'text-2xl md:text-[1.75rem] leading-[1.8]',
}

const sizeLabels: Record<ReadingSize, string> = {
  comfortable: 'A',
  large: 'A+',
  xlarge: 'A++',
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[.,;:!?'"“”]/g, '')
}

function isCorrect(activity: Activity, answer?: string) {
  if (!answer) return false
  if (activity.type === 'multiple-choice') return answer === activity.correctOptionId
  const accepted = [activity.answer, ...(activity.alternatives ?? [])]
  return accepted.some((expected) => normalize(expected) === normalize(answer))
}

export function LessonPlayer({ unitId, unitSlug, lesson, nextLesson }: Props) {
  const activities = lesson.activities ?? []
  const gradedActivities = activities.filter(
    (activity) => activity.type === 'multiple-choice' || activity.type === 'gap-fill'
  )
  const content = lesson.content
  const wordCount = useMemo(() => lessonWordCount(lesson), [lesson])
  const minutes = readingMinutes(wordCount)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [writing, setWriting] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [readingSize, setReadingSize] = useState<ReadingSize>('comfortable')
  const [serif, setSerif] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const startedAt = useRef(Date.now())

  const correctCount = gradedActivities.filter((activity) => isCorrect(activity, answers[activity.id])).length
  const score = gradedActivities.length
    ? Math.round((correctCount / gradedActivities.length) * 100)
    : null

  // Restore reading preferences and any saved writing for this lesson.
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('zl_reading_size') as ReadingSize | null
      const savedSerif = localStorage.getItem('zl_reading_serif')
      const savedWriting = localStorage.getItem(`zl_writing_${lesson.id}`)
      if (savedSize && savedSize in sizeClasses) setReadingSize(savedSize)
      if (savedSerif) setSerif(savedSerif === 'true')
      if (savedWriting) setWriting(savedWriting)
    } catch {
      // Ignore unavailable or corrupted local storage.
    }
    startedAt.current = Date.now()
  }, [lesson.id])

  useEffect(() => {
    try {
      localStorage.setItem(`zl_writing_${lesson.id}`, writing)
    } catch {
      // Ignore quota errors.
    }
  }, [writing, lesson.id])

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) {
        setScrollProgress(100)
        return
      }
      setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function setAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }))
  }

  function chooseReadingSize(size: ReadingSize) {
    setReadingSize(size)
    try {
      localStorage.setItem('zl_reading_size', size)
    } catch {
      // Ignore.
    }
  }

  function toggleSerif() {
    setSerif((current) => {
      try {
        localStorage.setItem('zl_reading_serif', String(!current))
      } catch {
        // Ignore.
      }
      return !current
    })
  }

  async function submit() {
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = getBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Sign in to save your progress.')

      const { data: existing } = await supabase
        .from('user_progress')
        .select('attempts')
        .eq('user_id', user.id)
        .eq('unit_id', unitId)
        .eq('lesson_id', lesson.id)
        .maybeSingle()

      const { error } = await upsertUserProgress({
        user_id: user.id,
        unit_id: unitId,
        lesson_id: lesson.id,
        status: score !== null && score < 80 ? 'in_progress' : 'completed',
        score,
        attempts: Number((existing as any)?.attempts ?? 0) + 1,
        time_spent_seconds: Math.round((Date.now() - startedAt.current) / 1000),
        completed_at: score !== null && score < 80 ? null : new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
      setSubmitted(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save progress.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Reading toolbar: size, typeface, progress, word count */}
      <div className="sticky top-16 z-20 -mx-1 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span> words
            <span className="mx-2">·</span>~{minutes} min read
            <span className="mx-2">·</span>
            {gradedActivities.length} questions
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" role="group" aria-label="Reading text size">
              {(Object.keys(sizeClasses) as ReadingSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => chooseReadingSize(size)}
                  aria-pressed={readingSize === size}
                  title={`Reading size: ${size}`}
                  className={cn(
                    'h-8 min-w-9 rounded-md border px-2 text-xs font-semibold transition-colors',
                    readingSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {sizeLabels[size]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleSerif}
              aria-pressed={serif}
              title="Toggle serif reading font"
              className={cn(
                'h-8 rounded-md border px-3 text-sm transition-colors',
                serif
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span className={serif ? 'font-serif' : ''}>Serif</span>
            </button>
            <a href="#exercises" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
              Exercises ↓
            </a>
          </div>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Reading content */}
      {content?.intro && (
        <section className="border-l-4 border-primary/40 pl-5 md:pl-7">
          <p className={cn('text-foreground/90', sizeClasses[readingSize], serif && 'font-serif')}>
            {content.intro}
          </p>
        </section>
      )}

      {content?.passages?.map((passage, index) => {
        const paragraphs = passageText(passage)
        return (
          <section key={index} className="scroll-mt-36">
            {passage.heading && (
              <h3 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">{passage.heading}</h3>
            )}
            <div className="space-y-6">
              {paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className={cn('text-foreground/90', sizeClasses[readingSize], serif && 'font-serif')}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )
      })}

      {content?.keyTerms && content.keyTerms.length > 0 && (
        <section className="scroll-mt-36">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Key vocabulary</h3>
            <span className="text-sm text-muted-foreground">{content.keyTerms.length} terms</span>
          </div>
          <dl className="grid gap-4 md:grid-cols-2">
            {content.keyTerms.map((item) => (
              <div key={item.term} className="rounded-xl border bg-card p-5">
                <dt className="text-lg font-semibold">{item.term}</dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">{item.meaning}</dd>
                {item.example && (
                  <dd className="mt-3 border-l-2 border-primary/30 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                    {item.example}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      )}

      {content?.writingTask && (
        <section className="rounded-xl border bg-card p-6 md:p-8">
          <h3 className="mb-3 text-2xl font-bold tracking-tight">Writing task</h3>
          <p className="mb-5 text-lg leading-relaxed text-foreground/90">{content.writingTask.prompt}</p>
          <ul className="mb-6 space-y-2">
            {content.writingTask.successCriteria.map((criterion) => (
              <li key={criterion} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 text-primary" aria-hidden="true">☐</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
          <label htmlFor="writing-answer" className="mb-2 block text-sm font-medium">
            Your answer
          </label>
          <textarea
            id="writing-answer"
            value={writing}
            onChange={(event) => setWriting(event.target.value)}
            rows={10}
            placeholder="Write your response here…"
            className="w-full rounded-lg border bg-background p-4 text-base leading-relaxed outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {writing.trim().split(/\s+/).filter(Boolean).length} words · saved in this browser as you type
          </p>
        </section>
      )}

      {/* Graded activities */}
      {gradedActivities.length > 0 && (
        <section id="exercises" className="scroll-mt-36">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Check your understanding</h3>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of {gradedActivities.length} answered
            </span>
          </div>
          <ol className="space-y-6">
            {gradedActivities.map((activity, index) => {
              const answer = answers[activity.id]
              const correct = submitted && isCorrect(activity, answer)
              const expected =
                activity.type === 'multiple-choice'
                  ? activity.options.find((option) => option.id === activity.correctOptionId)?.text
                  : activity.answer

              return (
                <li key={activity.id} className="rounded-xl border bg-card p-5 md:p-6">
                  <p className="mb-4 text-lg font-medium leading-relaxed">
                    <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                    {activity.prompt}
                  </p>

                  {activity.type === 'multiple-choice' ? (
                    <div className="space-y-2" role="radiogroup" aria-label={`Question ${index + 1}`}>
                      {activity.options.map((option) => {
                        const selected = answer === option.id
                        const showCorrect = submitted && option.id === activity.correctOptionId
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-base leading-relaxed transition-colors',
                              showCorrect
                                ? 'border-green-500 bg-green-500/10'
                                : selected && submitted
                                  ? 'border-red-500 bg-red-500/10'
                                  : selected
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:bg-muted/50'
                            )}
                          >
                            <input
                              type="radio"
                              name={activity.id}
                              value={option.id}
                              checked={selected}
                              onChange={() => setAnswer(activity.id, option.id)}
                              disabled={submitted}
                              className="mt-1"
                            />
                            <span>{option.text}</span>
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answer ?? ''}
                      onChange={(event) => setAnswer(activity.id, event.target.value)}
                      disabled={submitted}
                      placeholder="Type the missing word…"
                      aria-label={`Answer for question ${index + 1}`}
                      className={cn(
                        'w-full rounded-lg border bg-background p-4 text-base outline-none focus:ring-2 focus:ring-primary',
                        submitted && (correct ? 'border-green-500' : 'border-red-500')
                      )}
                    />
                  )}

                  {submitted && (
                    <div
                      className={cn(
                        'mt-4 rounded-lg p-4 text-sm leading-relaxed',
                        correct
                          ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                          : 'bg-red-500/10 text-red-700 dark:text-red-300'
                      )}
                    >
                      <p className="font-semibold">
                        {correct ? 'Correct' : `Incorrect — expected: ${expected}`}
                      </p>
                      {activity.explanation && <p className="mt-1 opacity-90">{activity.explanation}</p>}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* Submit / result */}
      <section className="rounded-xl border bg-muted/30 p-6 md:p-8">
        {!submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Answer all questions, then submit. Your score and time on task are written to your progress
              dashboard.
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Submit answers'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-2xl font-semibold">Lesson complete</h3>
              {score !== null && (
                <span
                  className={cn(
                    'text-3xl font-bold',
                    score >= 80 ? 'text-green-600' : 'text-amber-600'
                  )}
                >
                  {score}%
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {score === null
                ? 'Your writing response has been saved in this browser.'
                : score >= 80
                  ? 'You met the mastery threshold for this lesson. Your progress has been saved.'
                  : 'Review the feedback above and try again to reach 80%.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/progress"
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                View progress
              </Link>
              {nextLesson && (
                <Link
                  href={`/curriculum/${unitSlug}?lesson=${nextLesson.order}`}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Next: {nextLesson.title}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setAnswers({})
                  startedAt.current = Date.now()
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
      </section>
    </div>
  )
}
