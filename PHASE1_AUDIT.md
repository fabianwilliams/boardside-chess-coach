# Phase 1 Implementation Audit

**Date:** 2025-12-19
**Status:** Pre-Implementation Review
**Purpose:** Verify spec consistency and establish implementation guardrails before Phase 1 begins

---

## 1. Tooling Decisions (ADR-0001)

### Build System & Framework
- **Vite** - Fast HMR, modern ESM, TypeScript-first
- **React 18** with TypeScript strict mode
- **React Router v6** for client-side routing

### Chess Logic
- **chess.js** - Mature, battle-tested PGN parsing and move validation
- ~50KB minified, acceptable for 500KB budget

### Testing Stack
- **Jest** - Unit and integration tests
- **React Testing Library** - Component testing with accessibility focus
- **Playwright** - End-to-end browser automation
- **No Vitest** - Jest is authoritative choice (Vitest mentioned only as future alternative)

### Code Quality
- **TypeScript strict mode** - All strict compiler options enabled
- **ESLint** with:
  - @typescript-eslint/recommended
  - eslint-plugin-react-hooks
  - eslint-plugin-jsx-a11y (accessibility linting)
- **Prettier** - Auto-formatting (2-space indent, single quotes, trailing commas)

### Styling
- **CSS Modules** - Scoped component styles
- **CSS Variables** - Global theme tokens
- No Tailwind, no CSS-in-JS (zero runtime cost)

---

## 2. State Management Approach (ADR-0002)

### State Distribution Strategy

| State Type | Storage | Rationale |
|------------|---------|-----------|
| Game position, side, move index | URL query params | Deep linking, shareable, browser history |
| Player Profile (archetype) | localStorage | Persist across sessions |
| Chat messages | Component state | Ephemeral, session-only |
| UI state (loading, modals) | Component state | Local concerns |
| Archetype (in-memory) | React Context | Share across components |

### Key Decisions
- **No Redux/Zustand/Jotai** - Context API sufficient for MVP
- **URL as source of truth** for game state (enables deep linking requirement)
- **localStorage keys:**
  - `boardside_archetype` - Player Profile code ('TJ', 'TP', 'FJ', 'FP', 'Neutral')
  - `boardside_quiz_answers` - Answer history for retake comparison

### Implementation Pattern
```typescript
// URL state (react-router-dom)
const [searchParams, setSearchParams] = useSearchParams();
const gameId = searchParams.get('game') || 'default-game';
const side = searchParams.get('side') as 'A' | 'B' || 'A';
const currentPly = parseInt(searchParams.get('move') || '1', 10);

// localStorage (persistent)
localStorage.setItem('boardside_archetype', archetype);
const saved = localStorage.getItem('boardside_archetype');

// React Context (cross-component)
<ArchetypeContext.Provider value={{ archetype, setArchetype }}>
```

---

## 3. Chat Provider Architecture (ADR-0003)

### MVP Implementation
- **ChatProvider interface** - Abstraction for swappable implementations
- **LocalKnowledgeBaseProvider** - Keyword-based search in local JSON
  - No external API keys required
  - Synchronous search (<500ms response time)
  - Pattern: tokenize → search KB → rank matches → format response

### Knowledge Base Structure
```json
{
  "principles": {
    "Center Control": {
      "definition": "...",
      "importance": "...",
      "examples": ["e4", "d4"],
      "relatedConcepts": ["Space", "Development"]
    }
  },
  "concepts": { ... },
  "faq": [ ... ]
}
```

### Future (Post-MVP)
- **LLMChatProvider** stub may exist but must:
  - Fail safely if API key missing
  - Never be required for MVP functionality
  - Use same ChatProvider interface (zero refactoring)

---

## 4. Static Dataset Rule (MVP CRITICAL)

### ✅ CONFIRMED: Static Imports Only

**What this means:**
```typescript
// CORRECT (MVP pattern)
import gamesData from './data/sample-games.json';
import quizQuestions from './data/quiz-questions.json';
import knowledgeBase from './data/knowledge-base.json';

// WRONG (Post-MVP only)
const game = await import(`./data/games/${id}.json`); // NO dynamic imports
fetch('/api/games'); // NO runtime fetches
```

**MVP Characteristics:**
- ✅ Single JSON file per dataset
- ✅ Bundled at build time by Vite
- ✅ No `fetch()` calls
- ✅ No dynamic `import()`
- ✅ All 2 games in `sample-games.json`

**Source of Truth:**
- ARCHITECTURE.md Section 11.3
- PHASE-0-COMPLETE.md corrections
- SPEC.md Section 7.2 (Data Validation Rules)

**Why:**
- Azure Static Web Apps reliability
- CDN caching predictability
- Deployment simplicity
- No runtime failures

---

## 5. Routes & Pages (SPEC.md)

### Required Routes

| Route | Component | Purpose | Deep Linking |
|-------|-----------|---------|--------------|
| `/` | Home | Game library, quiz entry, Player Profile badge | N/A |
| `/quiz` | Quiz | Adaptive questionnaire (5-10 questions) | N/A |
| `/settings` | Settings | View/manage Player Profile, retake quiz | N/A |
| `/game/:gameId` | GameViewer | Board, moves, annotations, Side A/B toggle | `?side=A&move=12` |

**Note:** Hash routing (`#/`) acceptable for static hosting compatibility

### Page Requirements
- **Home:** Display games, "Start Quiz" button if no profile, navigation
- **Quiz:** Max 10 questions, stop early at 80% confidence, "Skip Quiz" option
- **Settings:** Display Player Profile, "Retake Quiz", "Reset Profile" buttons
- **GameViewer:** ChessBoard, MoveList, AnnotationPanel, nav controls, Side A/B switcher

---

## 6. CI/CD Requirements (SPEC.md)

### GitHub Actions Pipeline
**Triggers:** Push to main, PRs to main

**CI Steps (must all pass):**
1. `npm run lint` - ESLint zero errors
2. `npm run typecheck` - TypeScript strict mode, no errors
3. `npm run test` - Jest unit/integration tests
4. `npm run test:data-validation` - **CI GATE** (see section 7)
5. `npm run build` - Vite production build
6. Bundle size check - Fail if > 500KB gzipped

**Deployment (main branch only):**
- Azure Static Web Apps deployment
- Smoke test against deployed URL
- PR previews for all PRs

---

## 7. Dataset Validation CI Gate (CRITICAL)

### ⚠️ BLOCKING REQUIREMENT

**Task 10 (Data Validation Tests) must pass before UI work begins (Tasks 11-27).**

### Required Tests (`tests/data-validation/validateGames.test.ts`)
```typescript
// Using chess.js
describe('Dataset Validation', () => {
  it('validates all PGN strings are legal', () => {
    // Load sample-games.json
    // For each game side: parse PGN, replay all moves
    // Fail if any move is illegal
  });

  it('verifies ply numbers match move counts', () => {
    // Count moves in PGN
    // Compare to annotation ply count
    // Fail if mismatch
  });

  it('checks phase boundaries are valid', () => {
    // Ensure fromPly < toPly
    // No overlapping ranges
    // Covers all moves appropriately
  });

  it('ensures Side A and Side B share initial position', () => {
    // First 1-2 moves should match
  });

  it('validates annotation principles exist in KB', () => {
    // Cross-reference with knowledge-base.json
  });
});
```

### CI Configuration
- Add to `.github/workflows/ci-cd.yml`
- **Must block PR merge if failing**
- Run before `npm run build`

---

## 8. Acceptance Criteria (SPEC.md)

### Functional Completeness
- [ ] Adaptive quiz (5-10 questions, early stop, skip option)
- [ ] Game library display with filters
- [ ] Move-by-move navigation (keyboard + click)
- [ ] Annotations with Player Profile adaptation
- [ ] Side A/B switcher with confirmation
- [ ] Phases view (Opening/Middlegame/Endgame)
- [ ] Chat with LocalKnowledgeBaseProvider
- [ ] Deep linking restores exact position

### Technical Quality
- [ ] TypeScript strict mode, zero errors
- [ ] Unit tests ≥70% coverage for domain logic
- [ ] Data validation tests pass
- [ ] All CI checks green
- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse Accessibility ≥90

### Deployment
- [ ] Deploys to Azure Static Web Apps
- [ ] HTTPS enabled
- [ ] SPA routing works (refresh on /game/:id)
- [ ] CSP headers configured per ARCHITECTURE.md

---

## 9. Implementation Order (BACKLOG.md)

### Phase 1A: Foundation (Tasks 1-4)
1. Project scaffolding (Vite + React + TS)
2. ESLint + Prettier configuration
3. CI/CD pipeline (GitHub Actions)
4. Azure Static Web Apps config

### Phase 1B: Domain Logic (Tasks 5-7)
5. Chess domain module (ChessGame, MoveNavigator, PGNParser)
6. Quiz domain module (QuizEngine, ArchetypeCalculator)
7. Utility functions (urlState, localStorage, languageAdapter)

### Phase 1C: Data Layer (Tasks 8-10)
8. Quiz questions JSON
9. Knowledge base JSON
10. **⚠️ Data validation tests (CI GATE)** ← BLOCKING

### Phase 1D: UI Foundation (Tasks 11-13)
11. Routing and layout
12. Design system (CSS variables, globals)
13. Shared components (Button, Badge, ErrorBoundary)

### Phase 1E: Features (Tasks 14-23)
14-23. Pages, contexts, components

### Phase 1F: QA (Tasks 24-27)
24-27. A11y audit, E2E tests, optimization, docs

---

## 10. Potential Issues & Mitigations

### Issue: chess.js PGN parsing strictness
**Risk:** sample-games.json PGN may have formatting issues
**Mitigation:** Task 10 (data validation) catches this early, before UI work

### Issue: CSS Modules configuration in Vite
**Risk:** Import paths or scoping issues
**Mitigation:** Test in Task 12 (design system), documented pattern

### Issue: React Router URL state sync
**Risk:** Race conditions between URL updates and component renders
**Mitigation:** Use `useSearchParams` hook consistently, no manual URL manipulation

### Issue: localStorage availability
**Risk:** Browser privacy modes may block localStorage
**Mitigation:** Graceful degradation (neutral archetype if storage fails)

---

## 11. Consistency Check

### ✅ No Inconsistencies Found

**Verified:**
- ADR-0001 matches BACKLOG.md Task 1 dependencies (Jest, not Vitest)
- ADR-0002 matches ARCHITECTURE.md state management section
- ADR-0003 matches ARCHITECTURE.md ChatProvider interface
- SPEC.md routes match ARCHITECTURE.md pages table
- BACKLOG.md Task 10 aligns with SPEC.md Section 9.3 (data validation)
- Static dataset rule consistent across SPEC, ARCHITECTURE, PHASE-0-COMPLETE

**No ADR updates required before implementation.**

---

## 12. Pre-Flight Checklist

Before starting Task 1:
- [x] Audit complete
- [x] Tool choices confirmed (Vite, Jest, chess.js, etc.)
- [x] State strategy confirmed (URL + localStorage + Context)
- [x] Chat strategy confirmed (LocalKnowledgeBaseProvider)
- [x] Static dataset rule confirmed (no dynamic imports)
- [x] CI gate requirements understood (Task 10 blocks UI work)
- [x] No spec inconsistencies found

---

## 13. Implementation Guardrails

### ✅ DO
- Follow BACKLOG.md task order strictly
- Implement Task 10 (data validation) before Task 11 (UI)
- Use static imports for all JSON data
- Keep commits small, push frequently
- Run `npm run lint && npm run typecheck && npm run test && npm run build` before each commit
- Update ADR + docs BEFORE changing scope

### ❌ DO NOT
- Skip or reorder tasks without documenting why
- Use dynamic imports or fetch() for game data in MVP
- Add Redux/Zustand (Context API is authoritative)
- Use Vitest (Jest is authoritative)
- Merge PRs if CI is red
- Change scope without ADR

---

## Status

**Audit Complete:** ✅
**Ready for Task 1:** ✅
**Next Action:** Begin BACKLOG.md Task 1 (Project Scaffolding)
