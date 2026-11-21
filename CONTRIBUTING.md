# Contributing to ZERO-LANG

Thank you for your interest in contributing! ZERO-LANG is a community-driven project and we welcome contributions of all kinds.

## Ways to Contribute

### 📝 Content Contributions
- **Write units** — Create new curriculum units following our structure
- **Review content** — Check accuracy, clarity, CEFR alignment
- **Translate** — Localize interface and content (ES, PT, ZH, AR, FR priority)
- **Add vocabulary** — Expand collocations, examples, word families
- **Create exercises** — Design activities for existing lessons

### 💻 Code Contributions
- **Fix bugs** — Report and fix issues
- **Add features** — Implement new capabilities, progress views, etc.
- **Improve UI/UX** — Accessibility, responsiveness, design system
- **Write tests** — Unit, integration, E2E tests
- **Documentation** — Improve docs, add examples

### 🐛 Bug Reports & Feature Requests
- Use GitHub Issues with appropriate templates
- Provide reproduction steps for bugs
- Explain use case for features

## Getting Started

### Prerequisites
- Node.js 18+
- Git
- Supabase account (for local development)

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/zero-lang.git
cd zero-lang

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

### Content Development

Units live in `scripts/content/`. Each unit is an ES module exporting `unit` and `lessons`:

```json
{
  "id": "your-unit-slug",
  "slug": "your-unit-slug",
  "title": "Unit Title",
  "subtitle": "Brief description",
  "topic": "artificial_intelligence",
  "level": "C1",
  "order": 1,
  "estimatedHours": 4,
  "lessons": [...],
  "vocabulary": [...],
  "learningOutcomes": [...],
  "assessment": {...}
}
```

See existing units for reference. Run `npm run type-check` to validate.

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` — use proper types
- Interfaces over types for object shapes
- Discriminated unions for state

### React
- Functional components with hooks
- Server Components by default
- Client Components only when needed (`'use client'`)
- Compound components for complex UI (Tabs, Select)

### Styling
- Tailwind CSS utility classes
- `cn()` utility for class merging
- CSS variables for theming
- Responsive: mobile-first, `md:` `lg:` breakpoints

### Accessibility (WCAG AA)
- Semantic HTML
- ARIA labels where needed
- Focus visible states
- Color contrast ratios
- Keyboard navigation
- Screen reader testing

### Testing
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## Pull Request Process

1. **Branch** — Create from `main` with descriptive name: `feat/tutor-debate-mode`, `fix/srs-interval-calculation`
2. **Commits** — Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
3. **PR Description** — Link issue, describe changes, include screenshots for UI
4. **Checks** — All CI must pass (lint, type-check, tests)
5. **Review** — At least one approval required
6. **Merge** — Squash and merge

## Content Guidelines

### CEFR Alignment
- Target specific level (B2, C1, C2)
- Use [CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale)
- Tag vocabulary with CEFR level
- Learning outcomes = can-do statements

### Quality Standards
- **Accuracy** — Fact-check all claims, cite sources
- **Clarity** — Plain language, define technical terms
- **Register** — Model target register (academic, professional)
- **Authenticity** — Real-world texts, not invented examples
- **Progression** — Scaffold within and across units

### Sources & Licensing
- Prefer CC-BY, CC-BY-SA, CC0, public domain
- Cite all sources in unit metadata
- No copyrighted text beyond fair use
- Original content encouraged

### Review Checklist
- [ ] CEFR level appropriate throughout
- [ ] Learning outcomes measurable
- [ ] Vocabulary tagged with CEFR level
- [ ] Collocations included for key terms
- [ ] Activities have clear instructions
- [ ] Feedback config specified
- [ ] Sources cited with licenses
- [ ] Accessibility reviewed
- [ ] TypeScript types valid

## Community

- **Discord**: [discord.gg/zero-lang](https://discord.gg/zero-lang)
- **Discussions**: GitHub Discussions
- **Issues**: GitHub Issues

## Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Be respectful, inclusive, and constructive.

## Questions?

Open a GitHub Discussion or ask in Discord. We're happy to help!