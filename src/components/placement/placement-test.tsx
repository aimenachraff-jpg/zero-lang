'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getBrowserSupabaseClient } from '@/lib/supabase'

type Skill = 'Reading' | 'Grammar' | 'Vocabulary'

type Question = {
  id: string
  skill: Skill
  level: 'B2' | 'C1' | 'C2'
  prompt: string
  context?: string
  options: string[]
  answer: string
  explanation: string
}

const questions: Question[] = [
  {
    id: 'r1',
    skill: 'Reading',
    level: 'B2',
    context: 'Despite initial enthusiasm, the initiative was eventually abandoned owing to a lack of funding.',
    prompt: 'What does “owing to” mean in this sentence?',
    options: ['In addition to', 'Because of', 'In spite of', 'With regard to'],
    answer: 'Because of',
    explanation: '“Owing to” is a formal causal linker meaning “because of”.',
  },
  {
    id: 'r2',
    skill: 'Reading',
    level: 'C1',
    context: 'It is imperative that the committee submit its findings before the deadline.',
    prompt: 'Which grammatical feature does this sentence illustrate?',
    options: [
      'A reported question with inverted word order',
      'A mandative subjunctive using the bare infinitive',
      'A reduced relative clause',
      'A cleft sentence for emphasis',
    ],
    answer: 'A mandative subjunctive using the bare infinitive',
    explanation: 'After “it is imperative that”, formal English uses the mandative subjunctive: “that the committee submit”, not “submits”.',
  },
  {
    id: 'r3',
    skill: 'Reading',
    level: 'C2',
    context: 'Had the regulator intervened earlier, the systemic failure might have been averted.',
    prompt: 'What is the function of the opening clause “Had the regulator intervened earlier”?',
    options: [
      'It states a factual cause of the failure',
      'It expresses a hypothetical condition in the past',
      'It introduces a contrast with the main clause',
      'It reports what the regulator actually did',
    ],
    answer: 'It expresses a hypothetical condition in the past',
    explanation: 'Inversion without “if” (“Had … intervened”) is a formal third conditional: an unreal past condition and its imagined result.',
  },
  {
    id: 'g1',
    skill: 'Grammar',
    level: 'B2',
    prompt: 'Complete the sentence: “If I ___ more time, I would finish the report.”',
    options: ['have', 'had', 'would have', 'will have'],
    answer: 'had',
    explanation: 'A second conditional uses past simple in the if-clause and “would + infinitive” in the main clause.',
  },
  {
    id: 'g2',
    skill: 'Grammar',
    level: 'C1',
    prompt: 'Complete the sentence: “Not only ___ the proposal, but they also criticised its implementation.”',
    options: ['they rejected', 'did they reject', 'rejected they', 'they did reject'],
    answer: 'did they reject',
    explanation: 'A negative adverbial at the start triggers subject–auxiliary inversion: “Not only did they reject …”.',
  },
  {
    id: 'g3',
    skill: 'Grammar',
    level: 'C2',
    prompt: 'Complete the sentence: “Such ___ the complexity of the case that the inquiry was extended.”',
    options: ['was', 'it was', 'has been it', 'were'],
    answer: 'was',
    explanation: '“Such + be + subject + that …” is a formal inversive construction used for emphasis.',
  },
  {
    id: 'v1',
    skill: 'Vocabulary',
    level: 'B2',
    prompt: 'Which word completes the collocation: “to play a ___ role in the negotiations”?',
    options: ['decisive', 'decided', 'decision', 'decisively'],
    answer: 'decisive',
    explanation: '“Play a decisive role” is the standard collocation — an adjective is needed before “role”.',
  },
  {
    id: 'v2',
    skill: 'Vocabulary',
    level: 'C1',
    prompt: '“Mitigate” is closest in meaning to:',
    options: ['Aggravate', 'Alleviate', 'Anticipate', 'Investigate'],
    answer: 'Alleviate',
    explanation: 'To mitigate something is to make it less severe — the same sense as “alleviate”.',
  },
  {
    id: 'v3',
    skill: 'Vocabulary',
    level: 'C2',
    prompt: 'A “specious” argument is one that:',
    options: [
      'is logically airtight but unpopular',
      'is superficially plausible but actually wrong',
      'relies on statistical evidence',
      'has been proven beyond doubt',
    ],
    answer: 'is superficially plausible but actually wrong',
    explanation: '“Specious” describes reasoning that looks sound on the surface but does not withstand scrutiny.',
  },
]

type Result = {
  overall: 'B2' | 'C1' | 'C2'
  skills: Record<Skill, 'B2' | 'C1' | 'C2'>
  score: number
  saved: boolean
}

const levels = ['B2', 'C1', 'C2'] as const

function skillLevel(correct: number): 'B2' | 'C1' | 'C2' {
  if (correct >= 3) return 'C2'
  if (correct >= 2) return 'C1'
  return 'B2'
}

export function PlacementTest() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = getBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('placement_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data) setExisting(data)
    }
    load()
  }, [])

  async function submit() {
    setSaving(true)
    setLoadError(null)
    try {
      const skills = {} as Record<Skill, 'B2' | 'C1' | 'C2'>
      const perSkill: Record<Skill, number> = { Reading: 0, Grammar: 0, Vocabulary: 0 }
      for (const q of questions) {
        if (answers[q.id] === q.answer) perSkill[q.skill] += 1
      }
      for (const skill of Object.keys(perSkill) as Skill[]) {
        skills[skill] = skillLevel(perSkill[skill])
      }
      const score = Object.values(perSkill).reduce((a, b) => a + b, 0)
      const overallIndex = score >= 7 ? 2 : score >= 4 ? 1 : 0
      const overall = levels[overallIndex]

      const supabase = getBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      let saved = false
      if (user) {
        const { error: resultError } = await (supabase.from('placement_results') as any).insert({
          user_id: user.id,
          assessed_level: overall,
          confidence: 0.75,
          skill_breakdown: skills,
          responses: answers,
          version: '1.0',
        })
        if (resultError) throw new Error(resultError.message)

        const { data: existingLearner } = await (supabase.from('learner_profiles') as any)
          .select('target_level')
          .eq('user_id', user.id)
          .maybeSingle()
        const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        const currentTarget = existingLearner?.target_level ?? 'C1'
        const targetLevel = cefrOrder.indexOf(overall) > cefrOrder.indexOf(currentTarget)
          ? overall
          : currentTarget

        const { error: learnerError } = await (supabase.from('learner_profiles') as any).upsert(
          {
            user_id: user.id,
            current_level: overall,
            target_level: targetLevel,
            placement_completed: true,
            placement_score: { overall, skills, score },
          },
          { onConflict: 'user_id' }
        )
        if (learnerError) throw new Error(learnerError.message)
        saved = true
      }
      setResult({ overall, skills, score, saved })
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not save your result.')
    } finally {
      setSaving(false)
    }
  }

  if (result) {
    return (
      <section className="max-w-2xl mx-auto rounded-xl border bg-card p-8">
        <Badge variant="success">Assessment complete</Badge>
        <h2 className="text-3xl font-bold mt-4 mb-2">{result.overall}</h2>
        <p className="text-muted-foreground mb-6">
          {result.score} of {questions.length} correct · {result.saved ? 'Saved to your profile.' : 'Sign in to save this result.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-3 mb-7">
          {(Object.keys(result.skills) as Skill[]).map((skill) => (
            <div key={skill} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">{skill}</p>
              <p className="text-xl font-semibold mt-1">{result.skills[skill]}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/curriculum" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            See recommended units
          </Link>
          <Link href="/progress" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent">
            View progress
          </Link>
          <button
            type="button"
            onClick={() => { setResult(null); setAnswers({}) }}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Retake
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {existing && (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-sm">
          Last saved result: <strong>{existing.assessed_level}</strong> · {new Date(existing.completed_at).toLocaleDateString()}
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((question, index) => (
          <li key={question.id} className="rounded-xl border bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-muted-foreground">{index + 1}.</span>
              <Badge variant="outline">{question.skill}</Badge>
              <Badge variant="info">{question.level}</Badge>
            </div>
            {question.context && (
              <p className="mb-4 rounded-lg bg-muted/40 p-3 text-sm italic leading-relaxed">{question.context}</p>
            )}
            <p className="font-medium mb-4">{question.prompt}</p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                    answers[question.id] === option ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => setAnswers((a) => ({ ...a, [question.id]: option }))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          {Object.keys(answers).length} of {questions.length} answered
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={saving || Object.keys(answers).length < questions.length}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'See my level'}
        </button>
      </div>
      {loadError && <p className="mt-3 text-sm text-red-600">{loadError}</p>}
    </div>
  )
}
