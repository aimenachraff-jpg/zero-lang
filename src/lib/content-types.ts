/** Shared content types. Safe to import from client components. */

export type ChoiceActivity = {
  id: string
  type: 'multiple-choice'
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation?: string
}

export type GapFillActivity = {
  id: string
  type: 'gap-fill'
  prompt: string
  answer: string
  alternatives?: string[]
  explanation?: string
}

export type Activity = ChoiceActivity | GapFillActivity

export type Passage = {
  heading?: string
  text?: string
  paragraphs?: string[]
}

export type KeyTerm = {
  term: string
  meaning: string
  example?: string
}

export type LessonContent = {
  intro?: string
  passages?: Passage[]
  keyTerms?: KeyTerm[]
  writingTask?: { prompt: string; successCriteria: string[] }
}

export type Lesson = {
  id: string
  unit_id: string
  order: number
  type: string
  title: string
  objectives: string[] | null
  content: LessonContent | null
  activities: Activity[] | null
  estimated_minutes: number | null
}

export type UnitMetadata = {
  content_version?: number
  lesson_count?: number
  word_count?: number
  reading_minutes?: number
}

export type Unit = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  topic: string
  level: string
  order: number
  estimated_hours: number | null
  learning_outcomes: string[] | null
  published: boolean
  metadata?: UnitMetadata | null
  lessons: Lesson[]
}

export type VocabularyEntry = {
  id: string
  term: string
  lemma: string
  part_of_speech: string | null
  cefr_level: string
  definitions: { meaning: string; example?: string | null }[] | null
  tags: string[] | null
}
