# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**boardside-chess-coach** is a React SPA for chess learning where two humans play on a real board while the web app displays the position, move list, and strategic commentary. The application includes:
- Adaptive archetype quiz (Jung/Myers-Briggs-inspired, max 10 questions)
- Two teaching modes: Side A/Side B (strategy wins vs. loses) and Phases (Opening/Middlegame/Endgame)
- Chat component with local knowledge base (architected for future LLM integration)

Target deployment: Azure Static Web Apps

## Development Model

This repository follows a **spec-driven execution** model with two distinct phases:

### Phase 0: Specification Only (Current)
No implementation code should be written. Phase 0 deliverables are:
- `/SPEC.md` - Complete product specification
- `/ARCHITECTURE.md` - Component diagrams, modules, boundaries
- `/docs/adr/` - Architecture Decision Records (ADR-0001-tooling.md, etc.)
- `/BACKLOG.md` - 10-25 ordered implementation tasks with definition of done
- `/src/data/sample-games.json` - Sample chess games (already exists)

### Phase 1: Implementation (After Spec Approval)
Implementation strictly follows the approved spec. Any spec changes require:
1. An ADR explaining the change
2. Updates to SPEC.md / ARCHITECTURE.md
3. A commit referencing the ADR

## Data Model

Chess games are stored as JSON with the following structure:

```json
{
  "schemaVersion": "1.0",
  "games": [
    {
      "id": "game-identifier",
      "title": "Game Title",
      "opening": "Opening Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "tags": ["opening", "tactics", ...],
      "description": "Game description",
      "sides": {
        "A": {
          "label": "Side A description",
          "result": "1-0",
          "pgn": "1. e4 e5 2. Nf3...",
          "annotations": [
            {
              "ply": 1,
              "san": "e4",
              "principle": "Center Control",
              "text": "Explanation text"
            }
          ],
          "phases": [
            {
              "name": "Opening",
              "fromPly": 1,
              "toPly": 12,
              "overview": "Phase summary"
            }
          ]
        },
        "B": { /* Same structure */ }
      }
    }
  ]
}
```

**Key points:**
- `ply` is half-move number (1-indexed)
- `san` is Standard Algebraic Notation
- Side A typically shows strategy succeeding; Side B shows it failing or being neutralized
- Phases segment games into Opening/Middlegame/Endgame with boundaries

## Architecture Principles

When implementing (Phase 1):

### Component Boundaries
- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Domain**: Chess logic, game state, move validation
- **Providers**: Chat provider interface (local KB initially, LLM-swappable)
- **Data**: Static game content

### ChatProvider Interface
Design the chat component with a provider abstraction:
- MVP: Local knowledge base (no external API keys required)
- Future: Swappable LLM integration (OpenAI, Azure OpenAI, etc.)
- Interface should support both synchronous (KB) and async (LLM) responses

### State Management
- localStorage for user profile/quiz results
- URL query parameters for move index (deep linking)
- Consider Context API or state management library (to be decided in ADR)

### Chess Libraries
- Use established chess libraries (e.g., chess.js) for move validation and game logic
- Document library choice in ADR-0001-tooling.md or similar

## Testing Strategy

Include in SPEC.md:
- Unit tests for domain logic (move validation, game state)
- Integration tests for component interactions
- Dataset validation tests (ensure all PGN in sample-games.json is legal)
- Accessibility testing for WCAG compliance

## CI/CD Requirements

- GitHub Actions for build/test gates
- Azure Static Web Apps deployment pipeline
- Automated checks must pass before merge
- Consider: PGN validation, TypeScript checks, linting

## Observability

Minimal MVP approach:
- Console errors for debugging
- Optional: Azure Application Insights stub for future telemetry
- Document observability decisions in SPEC.md

## Git Workflow

- Small, frequent commits with clear messages
- Each ADR should be committed separately
- Reference ADRs in commit messages when making architectural changes
- Follow conventional commits format if established in ADR

## Important Notes

1. **Do not start implementation** until Phase 0 deliverables are reviewed and approved
2. **All architectural decisions** must be documented in `/docs/adr/`
3. **Sample data validation**: All moves in sample-games.json must be legal chess moves
4. **No external API keys**: MVP must work without OpenAI/Azure keys (local KB only)
5. **Accessibility first**: Plan for WCAG compliance from the start
6. **Deployment target**: Azure Static Web Apps architecture constraints apply
