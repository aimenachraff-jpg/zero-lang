'use client'

import { useMemo, useState } from 'react'
import type { VocabularyEntry } from '@/lib/content-types'
import { cn } from '@/lib/utils'

type UnitOption = { slug: string; title: string; level: string }

const levels = ['All', 'B2', 'C1', 'C2'] as const

export function VocabularyBrowser({
  entries,
  units,
}: {
  entries: VocabularyEntry[]
  units: UnitOption[]
}) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<(typeof levels)[number]>('All')
  const [unitSlug, setUnitSlug] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const unitBySlug = useMemo(() => new Map(units.map((unit) => [unit.slug, unit])), [units])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (level !== 'All' && entry.cefr_level !== level) return false
      if (unitSlug !== 'All' && !(entry.tags ?? []).includes(unitSlug)) return false
      if (!needle) return true
      const haystack = [
        entry.term,
        entry.lemma,
        ...(entry.definitions ?? []).map((definition) => definition.meaning),
        ...(entry.definitions ?? []).map((definition) => definition.example ?? ''),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [entries, query, level, unitSlug])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const entry of entries) {
      for (const tag of entry.tags ?? []) map.set(tag, (map.get(tag) ?? 0) + 1)
    }
    return map
  }, [entries])

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="sticky top-16 z-20 -mx-1 rounded-xl border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a term, a definition or an example…"
              aria-label="Search vocabulary"
              className="h-12 w-full rounded-lg border bg-background pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {levels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                aria-pressed={level === item}
                className={cn(
                  'h-10 rounded-lg border px-4 text-sm font-semibold transition-colors',
                  level === item
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm">
            <span className="font-medium text-muted-foreground">Unit</span>
            <select
              value={unitSlug}
              onChange={(event) => setUnitSlug(event.target.value)}
              className="h-10 min-w-52 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All units</option>
              {units.map((unit) => (
                <option key={unit.slug} value={unit.slug}>
                  {unit.title} ({counts.get(unit.slug) ?? 0})
                </option>
              ))}
            </select>
          </label>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
            {entries.length} terms
          </p>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 p-12 text-center">
          <p className="text-lg font-medium">No terms match that search.</p>
          <p className="mt-2 text-muted-foreground">
            Try a shorter query, or clear the level and unit filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setLevel('All')
              setUnitSlug('All')
            }}
            className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => {
            const definition = entry.definitions?.[0]
            const unit = (entry.tags ?? []).map((tag) => unitBySlug.get(tag)).find(Boolean)
            const isOpen = expanded === entry.id
            return (
              <li
                key={entry.id}
                className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    aria-expanded={isOpen}
                    className="text-left"
                  >
                    <span className="text-xl font-semibold leading-snug text-foreground">
                      {entry.term}
                    </span>
                  </button>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                      entry.cefr_level === 'C2'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : entry.cefr_level === 'C1'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {entry.cefr_level}
                  </span>
                </div>

                {definition && (
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {definition.meaning}
                  </p>
                )}

                {isOpen && definition?.example && (
                  <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                    “{definition.example}”
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  {unit && (
                    <a
                      href={`/curriculum/${unit.slug}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {unit.title}
                    </a>
                  )}
                  {definition?.example && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : entry.id)}
                      className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      {isOpen ? 'Hide example' : 'Show example'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
