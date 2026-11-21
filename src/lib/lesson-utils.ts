import type { Lesson, Passage } from '@/lib/content-types'

/** Client-safe helpers for lesson content. No server imports. */

export function passageText(passage: Passage): string[] {
  if (passage.paragraphs?.length) return passage.paragraphs
  if (passage.text) return [passage.text]
  return []
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function lessonWordCount(lesson: Lesson): number {
  const content = lesson.content
  if (!content) return 0
  const parts = [content.intro ?? '']
  for (const passage of content.passages ?? []) parts.push(...passageText(passage))
  return parts.reduce((total, part) => total + countWords(part), 0)
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / 180))
}
