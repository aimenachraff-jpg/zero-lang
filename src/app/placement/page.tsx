import type { Metadata } from 'next'
import { PlacementTest } from '@/components/placement/placement-test'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Placement Check',
  description: 'A nine-question CEFR placement check across reading, grammar and vocabulary, with results saved to your profile.',
}

export default function PlacementPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Placement Check</h1>
          <p className="text-lg text-muted-foreground">
            Nine real questions across reading, grammar and vocabulary. Your result is graded instantly and, if you are signed in, saved to your learner profile.
          </p>
        </div>

        <PlacementTest />

        <div className="max-w-3xl mx-auto mt-16">
          <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">About this check.</strong> This is a short CEFR-aligned placement tool, not an official exam. It cannot replace IELTS, TOEFL or Cambridge qualifications. It exists to point you at the right unit — nothing more.
          </div>
        </div>
      </div>
    </main>
  )
}
