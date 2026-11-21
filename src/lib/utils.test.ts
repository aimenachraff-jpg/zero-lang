import { cn, formatDate, formatRelativeTime, formatDuration, cefrToNumber, numberToCefr, compareCefr, getCefrColor, getCefrLabel, slugify, truncate, capitalize, titleCase, generateId, chunk, shuffle, uniqueBy, groupBy, clamp, roundTo, percentile, isValidEmail, isValidUrl, sanitizeHtml, initFSRS, nextInterval } from './utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional')
    })

    it('merges tailwind classes with twMerge', () => {
      expect(cn('p-2 p-4')).toBe('p-4')
    })
  })

  describe('Date formatting', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-11-21')
      expect(formatDate(date)).toContain('Nov')
      expect(formatDate(date)).toContain('21')
      expect(formatDate(date)).toContain('2026')
    })

    it('formats relative time', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago')
    })

    it('formats duration', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(90)).toBe('1m')
      expect(formatDuration(3600)).toBe('1h')
      expect(formatDuration(3660)).toBe('1h 1m')
    })
  })

  describe('CEFR utilities', () => {
    it('converts CEFR to number', () => {
      expect(cefrToNumber('A1')).toBe(0)
      expect(cefrToNumber('B2')).toBe(3)
      expect(cefrToNumber('C2')).toBe(5)
    })

    it('converts number to CEFR', () => {
      expect(numberToCefr(0)).toBe('A1')
      expect(numberToCefr(3)).toBe('B2')
      expect(numberToCefr(5)).toBe('C2')
      expect(numberToCefr(10)).toBe('C2') // clamped
      expect(numberToCefr(-1)).toBe('A1') // clamped
    })

    it('compares CEFR levels', () => {
      expect(compareCefr('A1', 'C2')).toBeLessThan(0)
      expect(compareCefr('C2', 'A1')).toBeGreaterThan(0)
      expect(compareCefr('B2', 'B2')).toBe(0)
    })

    it('returns CEFR colors', () => {
      expect(getCefrColor('C1')).toContain('red')
      expect(getCefrColor('B2')).toContain('orange')
      expect(getCefrColor('A1')).toContain('green')
    })

    it('returns CEFR labels', () => {
      expect(getCefrLabel('C2')).toBe('Proficiency')
      expect(getCefrLabel('B2')).toBe('Upper Intermediate')
      expect(getCefrLabel('A1')).toBe('Beginner')
    })
  })

  describe('String utilities', () => {
    it('slugifies text', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('AI & ML')).toBe('ai-ml')
      expect(slugify('  spaced  ')).toBe('spaced')
    })

    it('truncates text', () => {
      // truncate takes maxLength including the suffix, so 8 chars = "Hello W…" (7 + 1)
      expect(truncate('Hello World', 8)).toBe('Hello W…')
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('capitalizes', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('title cases', () => {
      expect(titleCase('hello world')).toBe('Hello World')
      expect(titleCase('AI and ML')).toBe('Ai And Ml')
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\w+_\w+$/)
    })
  })

  describe('Array utilities', () => {
    it('chunks arrays', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('shuffles arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      const shuffled = shuffle(arr)
      expect(shuffled).toHaveLength(5)
      expect(shuffled.sort()).toEqual(arr)
    })

    it('uniqueBy', () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 1 }]
      expect(uniqueBy(arr, x => x.id)).toHaveLength(2)
    })

    it('groups by key', () => {
      const arr = [{ type: 'a' }, { type: 'b' }, { type: 'a' }]
      const grouped = groupBy(arr, x => x.type)
      expect(grouped.a).toHaveLength(2)
      expect(grouped.b).toHaveLength(1)
    })
  })

  describe('Number utilities', () => {
    it('clamps values', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('rounds to decimals', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
      expect(roundTo(3.146, 2)).toBe(3.15)
    })

    it('calculates percentile', () => {
      expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3)
      expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1)
      expect(percentile([1, 2, 3, 4, 5], 100)).toBe(5)
    })
  })

  describe('Validation utilities', () => {
    it('validates emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })

    it('validates URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('not-a-url')).toBe(false)
    })

    it('sanitizes HTML', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).not.toContain('<script>')
      expect(sanitizeHtml('<p>Hello</p>')).toBe('<p>Hello</p>')
    })
  })

  describe('SRS (FSRS) utilities', () => {
    it('initializes FSRS state', () => {
      const state = initFSRS()
      expect(state.state).toBe('new')
      expect(state.stability).toBe(0)
      expect(state.reps).toBe(0)
    })

    it('calculates next interval for "again"', () => {
      const state = initFSRS(5)
      state.reps = 1
      state.stability = 10
      const next = nextInterval(state, 'again')
      expect(next.lapses).toBe(1)
      // Code uses original lapses (0) for state check, so first 'again' = 'learning'
      expect(next.state).toBe('learning')
    })

    it('calculates next interval for "good"', () => {
      const state = initFSRS(5)
      state.reps = 1
      state.stability = 10
      const next = nextInterval(state, 'good')
      expect(next.reps).toBe(2)
      expect(next.state).toBe('review')
    })

    it('marks as mastered at high stability', () => {
      const state = initFSRS()
      state.stability = 400
      state.reps = 10
      const next = nextInterval(state, 'good')
      expect(next.state).toBe('mastered')
    })
  })
})