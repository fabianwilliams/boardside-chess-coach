# boardside-chess-coach — Spec-Driven Build Doc

## Purpose
Build a production-quality MVP for a chess learning experience where two humans play on a real chessboard, while a web SPA shows the current position, move list, and strategic commentary per move. The app also includes:
- A short adaptive archetype quiz (Jung/Myers-Briggs-inspired, max 10 questions, stops early if confident, escape hatch)
- Two teaching modes:
  1) **Side A / Side B**: one variant where the showcased strategy wins, another where it loses (or is neutralized)
  2) **Phases**: Opening / Middlegame / Endgame segments with guidance
- A chat component that works without external keys (local knowledge base provider), while being architected to swap in an LLM later

Repo: **boardside-chess-coach**

---

## Operating model: Spec-driven execution

### Phase 0: Spec only (no implementation)
The coding agent must first produce a full specification, architecture, ADRs, and an ordered backlog. No app scaffolding or code beyond documentation and sample dataset during Phase 0.

### Phase 1: Implementation to the spec
After review/approval of Phase 0 deliverables, the agent implements strictly against the spec and backlog. Any spec changes require:
- An ADR explaining the change
- Updates to SPEC.md / ARCHITECTURE.md
- A commit referencing the ADR

---

## Phase 0 prompt (give this to the coding agent)

```text
You are an autonomous coding agent working in the GitHub repository: boardside-chess-coach.
Do NOT start implementation yet.

PHASE 0 GOAL
Produce a complete, reviewable product + engineering specification for the chess-learning SPA described below, suitable to drive implementation with minimal ambiguity.

DELIVERABLES (commit these to repo as Markdown)
1) /SPEC.md
   - Problem statement, goals, non-goals
   - Personas & user journeys
   - Functional requirements (profile quiz, game viewer, phases viewer, chat)
   - Non-functional requirements (performance, accessibility, security, reliability, maintainability)
   - Data model and content authoring format (JSON schema), including Side A/Side B & phase segmentation
   - UI/UX requirements (routes, layout, interactions, error states)
   - Testing strategy (unit/integration, dataset validation tests)
   - CI/CD requirements (GitHub Actions gates + Azure Static Web Apps deployment)
   - Observability/telemetry plan (minimal: console errors + optional App Insights stub)
   - Acceptance criteria checklist (explicit and testable)

2) /ARCHITECTURE.md
   - Component diagram (textual is fine)
   - Key modules and boundaries (pages/components/domain/providers/data)
   - ChatProvider interface and future LLM swap plan
   - Storage plan (localStorage for profile) and URL state plan (move index in query string)

3) /docs/adr/ADR-0001-tooling.md (and more ADRs if needed)
   - Record key decisions (Vite vs CRA, chess libs, whether SWA API is used in MVP)

4) /BACKLOG.md
   - 10–25 implementation tasks in dependency order, each with “definition of done”
   - Include dataset creation/validation and CI/CD tasks

5) /src/data/sample-games.json
   - Provide at least 2 sample games with Side A/Side B and phase segmentation
   - Moves must be legal (validated by chess.js in later steps)
   - Include per-move annotations

PROCESS RULES
- Work independently; do not ask me questions unless absolutely blocked.
- If a detail is underspecified, choose a sensible default and document it in SPEC.md and an ADR.
- Make small, frequent git commits with clear messages.
- The spec must be implementable as written; no “TBD” on core flows.

INPUT: PRODUCT DESCRIPTION
We are building an Azure Static Web Apps React SPA to guide two humans playing on a real board by showing move-by-move progressions, strategy explanations, Side A (strategy wins) and Side B (strategy loses), plus a phases view (opening/middlegame/endgame), and a short adaptive Jung/Myers-Briggs-style profile quiz (<=10 questions, stop early if confident, escape hatch).
Also include a chat component that works without external keys using a local knowledge base provider but is architected to allow future LLM integration.

When done, stop and await review before starting implementation.
