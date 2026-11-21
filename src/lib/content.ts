import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Unit, VocabularyEntry } from '@/lib/content-types'

export type {
  Activity,
  ChoiceActivity,
  GapFillActivity,
  KeyTerm,
  Lesson,
  LessonContent,
  Passage,
  Unit,
  UnitMetadata,
  VocabularyEntry,
} from '@/lib/content-types'

export async function getPublishedUnits(): Promise<Unit[]> {
  const supabase = createServerSupabaseClient()
  if (!supabase) return [] // build CI: no Supabase
  const { data, error } = await supabase
    .from('units')
    .select('*, lessons(id)')
    .eq('published', true)
    .order('order', { ascending: true })

  if (error) throw new Error(`Could not load units: ${error.message}`)
  return (data ?? []) as unknown as Unit[]
}

export async function getPublishedUnitBySlug(slug: string): Promise<Unit | null> {
  const supabase = createServerSupabaseClient()
  if (!supabase) return null // build CI: no Supabase
  const { data, error } = await supabase
    .from('units')
    .select('*, lessons(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) return null

  const unit = data as any
  return {
    ...unit,
    lessons: [...(unit.lessons ?? [])].sort((a: any, b: any) => a.order - b.order),
  } as Unit
}

export async function getVocabulary(): Promise<VocabularyEntry[]> {
  const supabase = createServerSupabaseClient()
  if (!supabase) return [] // build CI: no Supabase
  const { data, error } = await supabase
    .from('vocabulary')
    .select('id, term, lemma, part_of_speech, cefr_level, definitions, tags')
    .order('term', { ascending: true })

  if (error) throw new Error(`Could not load vocabulary: ${error.message}`)
  return (data ?? []) as unknown as VocabularyEntry[]
}
