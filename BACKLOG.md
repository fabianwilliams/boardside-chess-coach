# Implementation Backlog: Boardside Chess Coach

**Phase:** 1 (Implementation)
**Status:** Ready for execution (pending Phase 0 approval)
**Last Updated:** 2025-12-19

---

## Overview

This backlog contains 23 implementation tasks ordered by dependency. Each task includes:
- **Priority:** P0 (critical path), P1 (important), P2 (nice-to-have)
- **Estimated Effort:** S (1-2 days), M (3-5 days), L (6-10 days)
- **Dependencies:** Tasks that must be completed first
- **Definition of Done:** Explicit, testable criteria

Tasks are organized into phases to enable parallel work where possible.

---

## Task Status Legend

- 🔴 **Blocked:** Cannot start due to dependencies
- 🟡 **Ready:** Dependencies met, can start anytime
- 🟢 **In Progress:** Currently being worked on
- ✅ **Done:** Definition of done criteria met

---

## Phase 1A: Foundation & Setup (Parallel)

### Task 1: Project Scaffolding
**Priority:** P0 | **Effort:** S | **Dependencies:** None | **Status:** 🟡 Ready

**Description:** Initialize React + TypeScript + Vite project with required dependencies.

**Definition of Done:**
- [ ] `npm create vite@latest` with React + TypeScript template
- [ ] Install core dependencies: react-router-dom, chess.js, @types/chess.js
- [ ] Install dev dependencies: ESLint, Prettier, Jest, @testing-library/react
- [ ] Configure `tsconfig.json` with strict mode enabled
- [ ] Configure `vite.config.ts` with path aliases (@components, @domain, etc.)
- [ ] Create `src/` directory structure (pages/, components/, domain/, providers/, data/, hooks/, styles/)
- [ ] Project builds successfully with `npm run build`
- [ ] Dev server runs with `npm run dev`
- [ ] Commit scaffolding with message: "chore: initialize project with Vite + TypeScript"

---

### Task 2: ESLint & Prettier Configuration
**Priority:** P0 | **Effort:** S | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Set up linting and formatting rules per ADR-0001.

**Definition of Done:**
- [ ] Install ESLint plugins: @typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y
- [ ] Create `.eslintrc.json` with TypeScript and React rules
- [ ] Create `.prettierrc` with 2-space indent, single quotes, trailing commas
- [ ] Add `lint` and `format` scripts to package.json
- [ ] Run `npm run lint` with zero errors on scaffolded code
- [ ] Configure VSCode `.vscode/settings.json` for format-on-save
- [ ] Commit config with message: "chore: configure ESLint and Prettier per ADR-0001"

---

### Task 3: CI/CD Pipeline Setup
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 1, 2 | **Status:** 🔴 Blocked

**Description:** Create GitHub Actions workflow for build, test, and deployment.

**Definition of Done:**
- [ ] Create `.github/workflows/ci-cd.yml` with build-and-test and deploy jobs
- [ ] Build job runs: lint, type-check, test, build, bundle-size check
- [ ] Deploy job triggers on main branch push, uses Azure SWA deploy action
- [ ] Add `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to GitHub repo
- [ ] Test workflow on PR (should run build-and-test, deploy preview)
- [ ] Test workflow on main push (should deploy to production)
- [ ] Add GitHub Actions status badge to README.md
- [ ] Commit workflow with message: "ci: add GitHub Actions CI/CD pipeline"

---

### Task 4: Azure Static Web Apps Configuration
**Priority:** P0 | **Effort:** S | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Configure Azure SWA for SPA routing and security headers.

**Definition of Done:**
- [ ] Create `staticwebapp.config.json` with SPA fallback routes
- [ ] Add CSP header: `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:`
- [ ] Add security headers: x-frame-options, x-content-type-options
- [ ] Configure 404 rewrite to index.html
- [ ] Test locally with `npm run preview` that routes work
- [ ] Commit config with message: "chore: configure Azure Static Web Apps"

---

## Phase 1B: Domain Logic (Independent)

### Task 5: Chess Domain Module
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Implement core chess logic using chess.js library.

**Definition of Done:**
- [ ] Create `src/domain/chess/types.ts` with TypeScript interfaces (Move, Position, Annotation, etc.)
- [ ] Implement `ChessGame.ts` class with constructor(pgn), getCurrentPosition(), getMoveAt(ply)
- [ ] Implement `MoveNavigator.ts` class with next(), previous(), first(), last(), goToMove(ply)
- [ ] Implement `PGNParser.ts` with parsePGN(pgn) and validation functions
- [ ] Write unit tests for all functions (aim for 90% coverage)
- [ ] All tests pass with `npm run test`
- [ ] Document public APIs with JSDoc comments
- [ ] Commit with message: "feat(domain): implement chess game logic and navigation"

---

### Task 6: Quiz Domain Module
**Priority:** P1 | **Effort:** M | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Implement quiz engine and archetype calculation.

**Definition of Done:**
- [ ] Create `src/domain/quiz/types.ts` (Question, Answer, Archetype enums)
- [ ] Implement `QuizEngine.ts` with getNextQuestion(), shouldTerminateEarly(), calculateConfidence()
- [ ] Implement `ArchetypeCalculator.ts` with calculateArchetype(answers[])
- [ ] Create scoring algorithm: sum T/F and J/P dimensions, determine quadrant
- [ ] Early termination: stop at 5 questions if confidence ≥ 80%
- [ ] Write unit tests covering all archetype outcomes (TJ, TP, FJ, FP, Neutral)
- [ ] All tests pass
- [ ] Commit with message: "feat(domain): implement quiz engine and archetype calculator"

---

### Task 7: Utility Functions
**Priority:** P0 | **Effort:** S | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Implement utilities for URL state, localStorage, and language adaptation.

**Definition of Done:**
- [ ] Create `src/domain/utils/urlState.ts` with encodeGameState(), decodeGameState(), sanitizeGameState()
- [ ] Create `src/domain/utils/localStorage.ts` with save/load functions for archetype
- [ ] Create `src/domain/utils/languageAdapter.ts` with adaptAnnotation(text, archetype)
- [ ] Handle edge cases: corrupted localStorage, invalid URL params
- [ ] Write unit tests with 100% coverage (utilities are critical)
- [ ] All tests pass
- [ ] Commit with message: "feat(utils): add URL state, localStorage, and language adapter"

---

## Phase 1C: Data Layer

### Task 8: Quiz Questions Data
**Priority:** P1 | **Effort:** M | **Dependencies:** Task 6 | **Status:** 🔴 Blocked

**Description:** Create quiz-questions.json with 10 adaptive questions.

**Definition of Done:**
- [ ] Create `src/data/quiz-questions.json` with 10 questions
- [ ] Each question has 4 answers + "I'm not sure" option
- [ ] Answers scored on T/F and J/P dimensions (-2 to +2)
- [ ] Questions cover: learning style, decision-making, planning vs. flexibility, logic vs. intuition
- [ ] Validate JSON structure matches `types.ts` interface
- [ ] Test with QuizEngine to ensure all archetypes are reachable
- [ ] Commit with message: "data: add adaptive quiz questions for archetype detection"

---

### Task 9: Knowledge Base Data
**Priority:** P1 | **Effort:** L | **Dependencies:** Task 5 | **Status:** 🔴 Blocked

**Description:** Create knowledge-base.json with chess principles, concepts, and FAQ.

**Definition of Done:**
- [ ] Create `src/data/knowledge-base.json` per schema in ADR-0003
- [ ] Add all principles mentioned in `sample-games.json` annotations (15+ entries)
- [ ] Add 10+ chess concepts (tempo, space, initiative, piece activity, etc.)
- [ ] Add 20+ FAQ entries covering common beginner questions
- [ ] Each principle includes: definition, importance, examples, relatedConcepts, commonMistakes
- [ ] Validate JSON structure with TypeScript interface
- [ ] Review with chess expert or coach for accuracy
- [ ] Commit with message: "data: create knowledge base with principles, concepts, and FAQ"

---

### Task 10: Data Validation Tests
**Priority:** P0 | **Effort:** S | **Dependencies:** Task 5, 8, 9 | **Status:** 🔴 Blocked

**Description:** Write automated tests to validate all JSON data files.

**Definition of Done:**
- [ ] Create `tests/data-validation/validateGames.test.ts`
- [ ] Test: All PGN strings in `sample-games.json` are legal (use chess.js)
- [ ] Test: Ply numbers match move counts
- [ ] Test: Phase boundaries cover all moves without gaps
- [ ] Test: Side A and Side B share first move
- [ ] Test: All annotation principles exist in knowledge-base.json
- [ ] Test: quiz-questions.json matches schema
- [ ] Test: knowledge-base.json matches schema
- [ ] All data validation tests pass
- [ ] Add to CI pipeline (npm run test:data-validation)
- [ ] Commit with message: "test: add data validation suite for game, quiz, and KB JSON"

---

## Phase 1D: UI Foundation

### Task 11: Routing and Layout
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 1, 7 | **Status:** 🔴 Blocked

**Description:** Set up React Router with routes and main layout component.

**Definition of Done:**
- [ ] Install and configure react-router-dom v6
- [ ] Create routes: / (Home), /quiz (Quiz), /game/:gameId (GameViewer), /settings (Settings)
- [ ] Create `src/components/Navigation/Header.tsx` with logo and nav links
- [ ] Create `src/App.tsx` with Router and route definitions
- [ ] Implement 404 fallback (redirect to Home)
- [ ] Create basic layout with Header + main content area
- [ ] Test navigation between routes
- [ ] Commit with message: "feat(ui): add routing and main layout"

---

### Task 12: Design System (CSS Variables & Modules)
**Priority:** P1 | **Effort:** S | **Dependencies:** Task 1 | **Status:** 🔴 Blocked

**Description:** Create global styles, CSS variables, and module setup.

**Definition of Done:**
- [ ] Create `src/styles/variables.css` with CSS custom properties (colors, spacing, typography)
- [ ] Create `src/styles/globals.css` with reset, base typography, focus styles
- [ ] Define color palette (primary, secondary, background, text, error, success)
- [ ] Define spacing scale (4px base: 0.5rem, 1rem, 1.5rem, 2rem, etc.)
- [ ] Configure CSS Modules in vite.config.ts
- [ ] Test importing styles in a component
- [ ] Verify WCAG AA contrast ratios for all color pairs
- [ ] Commit with message: "style: create design system with CSS variables and modules"

---

### Task 13: Shared UI Components
**Priority:** P1 | **Effort:** M | **Dependencies:** Task 12 | **Status:** 🔴 Blocked

**Description:** Build reusable UI components (Button, Badge, ErrorBoundary).

**Definition of Done:**
- [ ] Create `src/components/shared/Button.tsx` with variants (primary, secondary, ghost)
- [ ] Create `src/components/shared/Badge.tsx` for archetype display
- [ ] Create `src/components/shared/ErrorBoundary.tsx` for error handling
- [ ] Add CSS Modules for each component
- [ ] Ensure keyboard accessibility (Tab, Enter/Space)
- [ ] Add ARIA labels where needed
- [ ] Write unit tests for each component
- [ ] Commit with message: "feat(ui): add shared components (Button, Badge, ErrorBoundary)"

---

## Phase 1E: Feature Implementation

### Task 14: Archetype Context Provider
**Priority:** P1 | **Effort:** S | **Dependencies:** Task 6, 7 | **Status:** 🔴 Blocked

**Description:** Implement ArchetypeContext for global archetype state.

**Definition of Done:**
- [ ] Create `src/providers/ArchetypeContext.tsx` with Context and Provider
- [ ] Implement useArchetype() custom hook
- [ ] Load archetype from localStorage on mount
- [ ] Provide setArchetype() and resetArchetype() functions
- [ ] Sync changes to localStorage
- [ ] Write integration tests (set archetype → read from localStorage)
- [ ] Commit with message: "feat(state): add ArchetypeContext provider"

---

### Task 15: Home Page (Game Library)
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 11, 13 | **Status:** 🔴 Blocked

**Description:** Build home page displaying game library with search/filter.

**Definition of Done:**
- [ ] Create `src/pages/Home.tsx`
- [ ] Load games from `sample-games.json`
- [ ] Display game cards with title, opening, difficulty, tags, description
- [ ] Add "Start Quiz" button prominently if archetype is null
- [ ] Add optional filter by difficulty or tags (nice-to-have)
- [ ] Navigate to `/game/:gameId` on game selection
- [ ] Responsive layout (mobile + desktop)
- [ ] Write integration test: load home → click game → navigate
- [ ] Commit with message: "feat(pages): implement home page with game library"

---

### Task 16: Quiz Page
**Priority:** P1 | **Effort:** M | **Dependencies:** Task 6, 8, 14 | **Status:** 🔴 Blocked

**Description:** Build quiz page with adaptive question flow.

**Definition of Done:**
- [ ] Create `src/pages/Quiz.tsx`
- [ ] Load questions from `quiz-questions.json`
- [ ] Display questions one at a time with answer options
- [ ] Implement "Skip Quiz" button
- [ ] Show progress indicator (e.g., "Question 3 of 10")
- [ ] Terminate early if confidence ≥ 80% (show "Confident result: TJ" message)
- [ ] Calculate archetype on completion, save to localStorage, update ArchetypeContext
- [ ] Navigate to Home on completion with archetype badge visible
- [ ] Write integration test: complete quiz → archetype saved
- [ ] Commit with message: "feat(pages): implement adaptive quiz with early termination"

---

### Task 17: ChessBoard Component
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 5, 12 | **Status:** 🔴 Blocked

**Description:** Build read-only chessboard component with accessibility.

**Definition of Done:**
- [ ] Create `src/components/ChessBoard/ChessBoard.tsx`
- [ ] Accept `position` prop (FEN string) and `orientation` prop (white/black)
- [ ] Render 8x8 grid with squares and pieces
- [ ] Use Unicode chess characters or SVG sprites
- [ ] Add ARIA labels for pieces (e.g., "White knight on f3")
- [ ] Add role="grid" and gridcell structure for screen readers
- [ ] Light/dark square colors meet WCAG AA contrast
- [ ] Responsive sizing (scale to container width)
- [ ] Write unit tests: render position → verify pieces at correct squares
- [ ] Commit with message: "feat(components): implement accessible ChessBoard component"

---

### Task 18: MoveList Component
**Priority:** P0 | **Effort:** S | **Dependencies:** Task 5, 12 | **Status:** 🔴 Blocked

**Description:** Build move list component with navigation and highlighting.

**Definition of Done:**
- [ ] Create `src/components/MoveList/MoveList.tsx`
- [ ] Accept `moves` array and `currentPly` prop
- [ ] Format moves as "1. e4 e5 2. Nf3 Nc6"
- [ ] Highlight current move with distinct background
- [ ] Auto-scroll current move into view
- [ ] Click move to emit onMoveClick(ply)
- [ ] Keyboard accessible (Tab to list, Arrow keys to navigate, Enter to select)
- [ ] Add aria-current="step" for current move
- [ ] Write unit tests
- [ ] Commit with message: "feat(components): implement MoveList with keyboard navigation"

---

### Task 19: Annotation Panel Component
**Priority:** P0 | **Effort:** M | **Dependencies:** Task 5, 7, 12, 14 | **Status:** 🔴 Blocked

**Description:** Build annotation display with archetype-adapted language.

**Definition of Done:**
- [ ] Create `src/components/Annotation/AnnotationPanel.tsx`
- [ ] Accept `annotation` and `archetype` props
- [ ] Display principle badge (styled)
- [ ] Display annotation text, adapted via languageAdapter.adapt(text, archetype)
- [ ] Test language adaptation for all 4 archetypes + Neutral
- [ ] Responsive design (readable on mobile)
- [ ] Write unit tests: verify adaptation logic
- [ ] Commit with message: "feat(components): add AnnotationPanel with archetype adaptation"

---

### Task 20: Game Viewer Page (Main)
**Priority:** P0 | **Effort:** L | **Dependencies:** Task 5, 7, 11, 17, 18, 19 | **Status:** 🔴 Blocked

**Description:** Build main game viewer page with board, moves, annotations, navigation.

**Definition of Done:**
- [ ] Create `src/pages/GameViewer.tsx`
- [ ] Read URL params: gameId, side, move (using useSearchParams)
- [ ] Load game data from sample-games.json
- [ ] Initialize ChessGame and MoveNavigator with selected side's PGN
- [ ] Render ChessBoard with current position
- [ ] Render MoveList with navigation
- [ ] Render AnnotationPanel for current move
- [ ] Add Previous/Next navigation buttons
- [ ] Implement keyboard shortcuts (Arrow keys, Home/End)
- [ ] Update URL on navigation (setSearchParams)
- [ ] Add "Switch to Side A/B" button with confirmation modal
- [ ] Handle invalid gameId (redirect to Home with error toast)
- [ ] Write E2E test: navigate game → URL updates → refresh restores position
- [ ] Commit with message: "feat(pages): implement GameViewer with move navigation"

---

### Task 21: Phases View Component
**Priority:** P1 | **Effort:** M | **Dependencies:** Task 5, 12, 20 | **Status:** 🔴 Blocked

**Description:** Build phases timeline view with navigation.

**Definition of Done:**
- [ ] Create `src/components/Phases/PhaseTimeline.tsx`
- [ ] Display 3 phases (Opening, Middlegame, Endgame) from game data
- [ ] Show phase name and move range (e.g., "Opening: Moves 1-12")
- [ ] Highlight current phase based on currentPly
- [ ] Click phase to jump to its fromPly (call onPhaseClick)
- [ ] Display phase overview text
- [ ] Handle games with unused phases ("Not reached")
- [ ] Add as tab in GameViewer (Tabs: Game | Phases | Chat)
- [ ] Write integration test: click phase → currentPly updates
- [ ] Commit with message: "feat(components): add Phases timeline view"

---

### Task 22: Chat Component with LocalKnowledgeBaseProvider
**Priority:** P1 | **Effort:** L | **Dependencies:** Task 5, 7, 9, 12 | **Status:** 🔴 Blocked

**Description:** Implement chat interface with local KB provider.

**Definition of Done:**
- [ ] Create `src/providers/ChatProvider.ts` interface per ADR-0003
- [ ] Implement `src/providers/LocalKnowledgeBaseProvider.ts` with search algorithm
- [ ] Create `src/components/Chat/ChatInterface.tsx`
- [ ] Create MessageList and MessageInput sub-components
- [ ] Integrate with LocalKnowledgeBaseProvider
- [ ] Pass GameContext (gameId, side, currentPly, position, annotation) to provider
- [ ] Display user and assistant messages
- [ ] Show loading indicator during search
- [ ] Show fallback message for no matches
- [ ] Add as tab in GameViewer
- [ ] Write integration tests: send query → receive response → display in list
- [ ] Test context awareness: query about current move principle
- [ ] Commit with message: "feat(chat): implement chat with LocalKnowledgeBaseProvider"

---

### Task 23: Settings Page
**Priority:** P2 | **Effort:** S | **Dependencies:** Task 11, 14 | **Status:** 🔴 Blocked

**Description:** Build settings page with archetype management.

**Definition of Done:**
- [ ] Create `src/pages/Settings.tsx`
- [ ] Display current archetype result with description
- [ ] Add "Retake Quiz" button → navigate to /quiz
- [ ] Add "Reset Quiz" button → clear archetype from localStorage
- [ ] Display app version and link to GitHub repo
- [ ] Add "About" section with app description
- [ ] Write integration test: reset archetype → localStorage cleared
- [ ] Commit with message: "feat(pages): add settings page with archetype management"

---

## Phase 1F: Testing & Quality Assurance

### Task 24: Accessibility Audit
**Priority:** P0 | **Effort:** S | **Dependencies:** All UI tasks (15-23) | **Status:** 🔴 Blocked

**Description:** Run accessibility audit and fix issues.

**Definition of Done:**
- [ ] Run Lighthouse accessibility audit on all pages (target: ≥90 score)
- [ ] Test keyboard navigation on all interactive elements
- [ ] Test with screen reader (NVDA or VoiceOver): ChessBoard, MoveList, Annotations
- [ ] Verify color contrast with automated tool (WCAG AA compliance)
- [ ] Test at 200% zoom (layout should not break)
- [ ] Fix all critical a11y issues
- [ ] Document findings and fixes in commit message
- [ ] Commit with message: "a11y: fix accessibility issues, achieve Lighthouse score ≥90"

---

### Task 25: End-to-End Tests
**Priority:** P0 | **Effort:** M | **Dependencies:** All feature tasks (15-23) | **Status:** 🔴 Blocked

**Description:** Write E2E tests for critical user journeys.

**Definition of Done:**
- [ ] Install and configure Playwright
- [ ] Create `tests/e2e/alex-persona.spec.ts` (structured learner journey)
- [ ] Create `tests/e2e/maya-persona.spec.ts` (intuitive learner journey)
- [ ] Create `tests/e2e/deep-linking.spec.ts` (share URL → restore position)
- [ ] All E2E tests pass locally
- [ ] Add E2E tests to CI pipeline (run on deploy job)
- [ ] Commit with message: "test(e2e): add Playwright tests for user journeys"

---

### Task 26: Bundle Size Optimization
**Priority:** P1 | **Effort:** S | **Dependencies:** Task 1, all feature tasks | **Status:** 🔴 Blocked

**Description:** Optimize bundle size to meet <500KB gzipped target.

**Definition of Done:**
- [ ] Run `npm run build` and check dist/ size
- [ ] Analyze bundle with vite-plugin-visualizer
- [ ] Implement code splitting: lazy-load ChessBoard, Chat, Phases components
- [ ] Tree-shake unused chess.js methods if possible
- [ ] Confirm total bundle size <500KB gzipped
- [ ] Add bundle size check script (fail CI if >500KB)
- [ ] Document bundle composition in commit message
- [ ] Commit with message: "perf: optimize bundle size, achieve <500KB gzipped target"

---

### Task 27: README and Documentation
**Priority:** P0 | **Effort:** S | **Dependencies:** All tasks | **Status:** 🔴 Blocked

**Description:** Write comprehensive README with setup and development instructions.

**Definition of Done:**
- [ ] Update `README.md` with project description
- [ ] Add "Getting Started" section (prerequisites, installation, dev server)
- [ ] Add "Development" section (npm scripts, project structure)
- [ ] Add "Testing" section (unit, integration, E2E, data validation)
- [ ] Add "Deployment" section (Azure SWA setup, environment variables)
- [ ] Add "Architecture" section (link to ARCHITECTURE.md and ADRs)
- [ ] Add badges: CI status, bundle size, license
- [ ] Review for clarity and completeness
- [ ] Commit with message: "docs: update README with setup and development guide"

---

## Dependency Graph (Simplified)

```
Task 1 (Scaffolding)
  ├─→ Task 2 (ESLint)
  │     └─→ Task 3 (CI/CD)
  ├─→ Task 4 (Azure Config)
  ├─→ Task 5 (Chess Domain) → Task 9 (KB Data) → Task 10 (Validation)
  ├─→ Task 6 (Quiz Domain) → Task 8 (Quiz Data)
  ├─→ Task 7 (Utils)
  ├─→ Task 11 (Routing) → Task 15 (Home Page)
  └─→ Task 12 (Design System)
        └─→ Task 13 (Shared Components)

Task 5, 6, 7, 14 → Task 16 (Quiz Page)
Task 5, 7, 12, 17, 18, 19 → Task 20 (Game Viewer)
Task 20 → Task 21 (Phases)
Task 5, 7, 9, 12 → Task 22 (Chat)
Task 11, 14 → Task 23 (Settings)

All UI tasks → Task 24 (A11y Audit)
All feature tasks → Task 25 (E2E Tests)
All tasks → Task 26 (Bundle Optimization)
All tasks → Task 27 (README)
```

---

## Parallel Work Opportunities

**Week 1:**
- Dev 1: Tasks 1, 2, 3, 4 (setup)
- Dev 2: Task 5 (Chess domain)
- Dev 3: Task 6 (Quiz domain)

**Week 2:**
- Dev 1: Task 11, 12 (routing + design)
- Dev 2: Task 9 (KB data) + Task 10 (validation)
- Dev 3: Task 8 (Quiz data) + Task 7 (utils)

**Week 3:**
- Dev 1: Task 15 (Home) + Task 13 (Shared components)
- Dev 2: Task 17, 18, 19 (Board, MoveList, Annotations)
- Dev 3: Task 14 (Context) + Task 16 (Quiz page)

**Week 4:**
- Dev 1: Task 20 (Game Viewer) - blocking task
- Dev 2: Task 22 (Chat)
- Dev 3: Task 21 (Phases) + Task 23 (Settings)

**Week 5:**
- All devs: Tasks 24-27 (testing, optimization, docs)

**Estimated Timeline:** 4-5 weeks with 3 developers

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| chess.js PGN parsing fails on sample games | Low | High | Validate all PGN in Task 10 early |
| Bundle size exceeds 500KB | Medium | Medium | Monitor in Task 26, lazy-load components |
| A11y audit finds critical issues | Medium | High | Test incrementally during Task 13-23 |
| CI/CD pipeline configuration issues | Low | High | Set up early (Task 3), test on PR |
| Knowledge base content quality low | Medium | Medium | Review with chess expert in Task 9 |
| Archetype adaptation too subtle/unnoticeable | Low | Low | User testing post-MVP, can enhance later |

---

## Out of Scope (Post-MVP)

The following are explicitly deferred to Phase 2+:
- LLM chat integration (keep LocalKB for MVP)
- Additional games beyond the 2 in sample-games.json
- User-generated content (upload PGN)
- Social features (sharing, comments)
- Dark mode toggle
- Internationalization (i18n)
- Mobile native apps

---

## Success Criteria (MVP Complete)

The backlog is complete when:
- [ ] All tasks marked ✅ Done
- [ ] All acceptance criteria in SPEC.md met
- [ ] CI/CD pipeline passing (lint, test, build, deploy)
- [ ] Lighthouse scores: Performance ≥85, Accessibility ≥90
- [ ] Bundle size <500KB gzipped
- [ ] Manual QA: all user journeys work on Chrome, Firefox, Safari
- [ ] README complete with setup instructions
- [ ] Application deployed to Azure Static Web Apps production

---

## Notes for Implementation

1. **Small commits:** Each task should produce 2-5 commits (not one giant commit)
2. **Test-driven:** Write tests before or alongside implementation (not after)
3. **Code review:** All tasks require PR review before merging to main
4. **Documentation:** Update inline comments and JSDoc as you code
5. **Accessibility:** Test keyboard nav and screen reader compatibility during development, not just in Task 24

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-19 | Initial backlog for Phase 0 review |
