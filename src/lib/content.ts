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
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('units')
      .select('*, lessons(id)')
      .eq('published', true)
      .order('order', { ascending: true })

    if (error) return []
    return (data ?? []) as unknown as Unit[]
  } catch {
    return []
  }
}

export async function getPublishedUnitBySlug(slug: string): Promise<Unit | null> {
  try {
    const supabase = createServerSupabaseClient()
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
  } catch {
    return null
  }
}

export async function getVocabulary(): Promise<VocabularyEntry[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('vocabulary')
      .select('id, term, lemma, part_of_speech, cefr_level, definitions, tags')
      .order('term', { ascending: true })

    if (error) return []
    return (data ?? []) as unknown as VocabularyEntry[]
  } catch {
    return []
  }
}
