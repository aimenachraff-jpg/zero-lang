# ZERO-LANG Decision Log

## Gate A — Founder Context & Economics (Approved: 2026-11-21)

### Context Decisions

| Field | Decision | Rationale |
|-------|----------|-----------|
| **Background** | Software engineer / full-stack | Can build web/mobile, APIs, databases |
| **Team** | Solo (AI agent builds) | Founder directs; agent implements |
| **Budget** | **$0** — free tiers only | No personal burn, no external funding |
| **Timeline** | 6 months to "real learner value" | No hard deadline; measurable progress gate |
| **Learners** | Global, English UI v1; top L1s: ES, PT, ZH, AR, FR | Broad reach; localisation later |
| **Organisation** | Open-source (community-driven) | MIT/Apache; contributors > employees |
| **Assets** | Zero — pure greenfield | No legacy, no constraints |
| **Stack** | Any stack optimized for free tier | Vercel/Netlify + Supabase/Turso + GitHub Actions |
| **Success** | 1yr: 1k active (≥1 unit/mo); 3yr: 50k, 3 langs, sustainable | Usage-based, not vanity metrics |
| **Non-negotiables** | MIT/Apache, no telemetry, no dark patterns, no training on learner data, honest CEFR alignment | Ethical open-source defaults |

### Economics Model (Zero-Marginal-Cost Core)

| Cost Center | Strategy | Hard Limit |
|-------------|----------|------------|
| Hosting | Vercel/Netlify/GitHub Pages + Supabase/Turso/Firebase free tiers | ~100k MAU |
| **AI Inference (Core Curriculum)** | **Zero AI** — static, pre-generated content | $0 |
| **AI Inference (Tutor)** | **BYOK (Bring Your Own Key)** or local-first (llama.cpp/ollama) | User pays / runs locally |
| Speech (ASR/TTS) | Browser Web Speech API + open-source (Whisper.cpp, Piper) | On-device, free |
| Content | Founder-created + community contributions (Git/PR workflow) | Time + goodwill |
| Database/Auth | Supabase (500MB) / Firebase Spark / Turso (9GB) | ~10k–50k users |

### Risk Acceptance

| # | Risk | Mitigation |
|---|------|------------|
| 1 | AI tutor unsustainable at $0 | Scope to BYOK/local; curriculum = free core |
| 2 | Content pipeline = founder labour | Design for community contributions from day 1 |
| 3 | No distribution channel | SEO content + GitHub community + learn in public |
| 4 | Quality control without paid reviewers | Automated CEFR checks + peer review PRs |
| 5 | Solo burnout | Ruthless MVP scope; ship one vertical slice first |

### Reversibility

- **Org structure**: Reversible (can incorporate later)
- **Stack**: Reversible (standard web tech)
- **AI tutor scope**: Reversible (can add cloud later if funded)
- **Content license**: Irreversible once published (MIT/Apache)

---

## Next Gates

| Gate | Trigger | Decision Required |
|------|---------|-------------------|
| **Gate B** | Learner research + competitive audit complete | Personas, JTBD, feature priorities, validated "why not ChatGPT" |
| **Gate C** | Unit anatomy + placement design + content source mix | MVP vertical slice definition |
| **Gate D** | AI tutor MVP scope + eval framework + cost ceiling | Tutor architecture (BYOK vs local vs none) |
| **Gate E** | Tech stack + architecture + data/privacy model | Repo structure, database schema, auth |
| **Gate F** | MVP definition (what, for whom, success criteria) | Build sprint plan |