/**
 * ZERO-LANG content seed.
 *
 * Upserts the full content library into Supabase via the REST API.
 * Safe to re-run: units are matched by slug, lessons by (unit_id, order),
 * and vocabulary is rebuilt per unit.
 *
 * Run: node scripts/seed.mjs
 */
import { readFileSync } from 'node:fs'
import { unit as climateUnit, lessons as climateLessons } from './content/climate.mjs'
import { unit as aiUnit, lessons as aiLessons } from './content/ai.mjs'
import { unit as philosophyUnit, lessons as philosophyLessons } from './content/philosophy.mjs'
import { unit as economicsUnit, lessons as economicsLessons } from './content/economics.mjs'
import { unit as scienceUnit, lessons as scienceLessons } from './content/science.mjs'
import { unit as mediaUnit, lessons as mediaLessons } from './content/media.mjs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) throw new Error('Missing Supabase env vars')

async function api(table, method = 'GET', body, prefer = 'return=representation') {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${table} failed ${res.status}: ${text}`)
  return text ? JSON.parse(text) : []
}

const library = [
  { unit: climateUnit, lessons: climateLessons },
  { unit: aiUnit, lessons: aiLessons },
  { unit: philosophyUnit, lessons: philosophyLessons },
  { unit: economicsUnit, lessons: economicsLessons },
  { unit: scienceUnit, lessons: scienceLessons },
  { unit: mediaUnit, lessons: mediaLessons },
]

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function lessonWordCount(lesson) {
  const content = lesson.content || {}
  const parts = [content.intro || '']
  for (const passage of content.passages || []) {
    if (Array.isArray(passage.paragraphs)) parts.push(...passage.paragraphs)
    else if (passage.text) parts.push(passage.text)
  }
  return parts.reduce((total, part) => total + wordCount(part), 0)
}

function vocabularyFromLesson(lesson) {
  return (lesson.content?.keyTerms || []).map((entry) => ({
    term: entry.term,
    meaning: entry.meaning,
    example: entry.example,
  }))
}

async function upsertUnit(unit, metadata) {
  const row = { ...unit, metadata }
  const existing = await api(`units?select=id&slug=eq.${encodeURIComponent(unit.slug)}`)
  if (existing.length) {
    await api(`units?id=eq.${existing[0].id}`, 'PATCH', row, 'return=minimal')
    return existing[0].id
  }
  const inserted = await api('units', 'POST', row)
  return inserted[0].id
}

async function upsertLessons(unitId, lessons) {
  const existing = await api(`lessons?select=id,"order"&unit_id=eq.${unitId}`)
  const byOrder = new Map(existing.map((lesson) => [lesson.order, lesson.id]))
  let created = 0
  let updated = 0

  for (const lesson of lessons) {
    const row = { ...lesson, unit_id: unitId }
    const id = byOrder.get(lesson.order)
    if (id) {
      await api(`lessons?id=eq.${id}`, 'PATCH', row, 'return=minimal')
      updated += 1
    } else {
      await api('lessons', 'POST', row)
      created += 1
    }
  }

  const wanted = new Set(lessons.map((lesson) => lesson.order))
  const extras = existing.filter((lesson) => !wanted.has(lesson.order))
  for (const lesson of extras) {
    await api(`lessons?id=eq.${lesson.id}`, 'DELETE', undefined, 'return=minimal')
  }

  return { created, updated, removed: extras.length }
}

async function rebuildVocabulary(unitId, level, slug, lessons) {
  await api(`vocabulary?unit_id=eq.${unitId}`, 'DELETE', undefined, 'return=minimal')

  const seen = new Set()
  const rows = []
  for (const lesson of lessons) {
    for (const entry of vocabularyFromLesson(lesson)) {
      const key = entry.term.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({
        unit_id: unitId,
        term: entry.term,
        lemma: key,
        part_of_speech: null,
        cefr_level: level,
        frequency_band: 5,
        definitions: [{ meaning: entry.meaning, example: entry.example || null }],
        tags: [slug],
      })
    }
  }

  if (rows.length) await api('vocabulary', 'POST', rows)
  return rows.length
}

async function main() {
  console.log('Seeding ZERO-LANG library…\n')

  let totalLessons = 0
  let totalWords = 0
  let totalVocabulary = 0

  for (const { unit, lessons } of library) {
    const words = lessons.reduce((sum, lesson) => sum + lessonWordCount(lesson), 0)
    const readingMinutes = Math.ceil(words / 180)
    const metadata = {
      content_version: 2,
      lesson_count: lessons.length,
      word_count: words,
      reading_minutes: readingMinutes,
    }

    const unitId = await upsertUnit(unit, metadata)
    const result = await upsertLessons(unitId, lessons)
    const vocabularyCount = await rebuildVocabulary(unitId, unit.level, unit.slug, lessons)

    totalLessons += lessons.length
    totalWords += words
    totalVocabulary += vocabularyCount

    console.log(
      `✓ ${unit.title} (${unit.level}) — ${lessons.length} lessons, ${words.toLocaleString()} words, ${vocabularyCount} terms` +
        ` [${result.created} new, ${result.updated} updated${result.removed ? `, ${result.removed} removed` : ''}]`
    )
  }

  console.log('\n────────────────────────────────────────────')
  console.log(`Units:      ${library.length}`)
  console.log(`Lessons:    ${totalLessons}`)
  console.log(`Words:      ${totalWords.toLocaleString()}`)
  console.log(`Vocabulary: ${totalVocabulary}`)
  console.log('────────────────────────────────────────────')

  // Real learner profile for the test user (only if missing).
  const userId = 'ebd9ec94-c948-406f-b0f4-59c1db0a300d'
  if (!(await api(`profiles?select=id&id=eq.${userId}`)).length) {
    await api('profiles', 'POST', {
      id: userId,
      email: 'aimenachraff@gmail.com',
      full_name: 'aymen',
      native_language: 'ar',
      known_languages: ['ar', 'en', 'fr'],
    })
    console.log('✓ profile created')
  }

  if (!(await api(`learner_profiles?select=id&user_id=eq.${userId}`)).length) {
    await api('learner_profiles', 'POST', {
      user_id: userId,
      current_level: 'B2',
      target_level: 'C1',
      primary_goal: 'career_advancement',
      placement_completed: false,
    })
    console.log('✓ learner profile created')
  }

  console.log('\nDone. Verify with: GET /rest/v1/units?select=slug,level,title,metadata')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
