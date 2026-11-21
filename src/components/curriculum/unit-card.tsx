'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UnitCardProps {
  unit: {
    id: string
    slug: string
    title: string
    subtitle: string
    topic: string
    level: 'B2' | 'C1' | 'C2'
    order: number
    estimatedHours: number
    lessons: number
    wordCount: number
    readingMinutes: number
    outcomes: string[]
  }
}

const topicIcons: Record<string, string> = {
  artificial_intelligence: '🤖',
  climate_change: '🌍',
  economics: '📈',
  philosophy: '🤔',
  history: '📜',
  science_technology: '🔬',
  global_health: '🏥',
  politics_governance: '🏛️',
  culture_society: '🎭',
  education_future: '🎓',
  space_exploration: '🚀',
  ethics_technology: '⚖️',
}

const levelColors: Record<string, 'destructive' | 'warning' | 'info'> = {
  C2: 'destructive',
  C1: 'warning',
  B2: 'info',
}

export function UnitCard({ unit }: UnitCardProps) {
  const levelVariant = levelColors[unit.level] || 'info'
  const topicIcon = topicIcons[unit.topic] || '📚'

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" aria-hidden="true">{topicIcon}</span>
              <Badge variant={levelVariant} className="text-xs">
                {unit.level}
              </Badge>
            </div>
            <CardTitle className="text-lg">{unit.title}</CardTitle>
            <CardDescription className="text-base">{unit.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {unit.lessons} lessons
          </Badge>
          <Badge variant="outline" className="text-xs">
            {unit.wordCount.toLocaleString()} words
          </Badge>
          <Badge variant="outline" className="text-xs">
            ~{unit.estimatedHours}h
          </Badge>
        </div>
        <ul className="space-y-2 mb-6 flex-1" role="list">
          {unit.outcomes.slice(0, 3).map((outcome, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="flex-shrink-0 mt-0.5 text-primary">→</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/curriculum/${unit.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border-t pt-4 mt-auto"
        >
          Start Unit
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  )
}