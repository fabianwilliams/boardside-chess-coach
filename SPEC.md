# Product Specification: Boardside Chess Coach

**Version:** 1.0
**Status:** Phase 0 - Awaiting Approval
**Last Updated:** 2025-12-19

---

## 1. Problem Statement

Chess learners struggle to understand strategic concepts when studying games in isolation. Traditional chess instruction either:
- Shows only winning moves without demonstrating what happens when the strategy fails
- Lacks adaptive personalization based on learning style or cognitive preferences
- Requires expensive human coaches or complex software with steep learning curves

Players learning with physical boards often lack real-time guidance and strategic context for the moves being played.

## 2. Goals

1. **Dual-Perspective Learning**: Enable learners to see both sides of a strategic idea by comparing games where the strategy succeeds (Side A) versus fails or is neutralized (Side B)
2. **Phase-Based Understanding**: Segment games into Opening, Middlegame, and Endgame phases with targeted guidance for each
3. **Personalized Experience**: Adapt the teaching approach based on a brief archetype quiz inspired by Jungian personality types
4. **Physical Board Integration**: Support two humans playing on a real board while the web app provides synchronized guidance
5. **Accessible Learning**: Create a web-based MVP that works without external API keys or paid services
6. **Future Extensibility**: Architect the chat component to easily swap from local knowledge base to LLM integration

## 3. Non-Goals

For the MVP, we explicitly exclude:
- Real-time move detection via camera/sensors (manual navigation only)
- Multiplayer online play or move transmission between devices
- Chess engine analysis or computer opponent
- User-generated content or game upload functionality
- Social features (sharing, comments, ratings)
- Mobile native apps (responsive web only)
- Payment processing or subscription management
- Complex authentication (localStorage profile only)
- Multi-language support (English only for MVP)

## 4. Personas & User Journeys

### Persona 1: Alex - The Structured Learner
**Profile:** 28-year-old software engineer, rated 1200 USCF, prefers systematic learning
**Archetype Result:** Thinking/Judging (analytical, organized)

**User Journey:**
1. Visits site, takes 10-question adaptive quiz → identified as Thinking/Judging type
2. Selects "Wayward Queen Attack" game from library
3. Reviews game overview and Side A/Side B comparison table
4. Plays through Side A move-by-move on physical board
5. Reads strategic annotations emphasizing logical patterns and systematic defense
6. Switches to Side B to see the defensive refutation
7. Uses Phases view to understand opening mistakes vs middlegame compensation
8. Asks chat: "What's the key principle difference between move 6 in Side A vs Side B?"
9. Receives structured response from local knowledge base
10. Bookmarks game and returns later via URL (move index preserved)

### Persona 2: Maya - The Intuitive Player
**Profile:** 19-year-old college student, casual player, learns by feeling and experimentation
**Archetype Result:** Feeling/Perceiving (intuitive, flexible)

**User Journey:**
1. Takes quiz, clicks "I'm not sure" on several questions → stops early at question 7
2. Receives Feeling/Perceiving archetype
3. Browses games, attracted to "King's Pawn Principles" with visual activity
4. Plays through Side A quickly, focusing on the attack narrative
5. Reads annotations emphasizing pattern recognition and dynamic play
6. Jumps directly to critical moments via phase segmentation
7. Uses chat to explore "What would happen if Black played ...d5 earlier?"
8. Sees Side B comparison to understand the contrast
9. Revisits opening phase to understand setup
10. Shares URL with study partner (same move position)

### Persona 3: Jordan - The Coach
**Profile:** 45-year-old chess coach, rated 2000 USCF, teaching club students
**Archetype Result:** Skips quiz (optional)

**User Journey:**
1. Clicks "Skip Quiz" → proceeds as neutral/default archetype
2. Reviews game library for teaching-appropriate content
3. Projects browser on screen during club session
4. Two students play Side A on physical board while Jordan navigates the app
5. Pauses at critical moments to discuss annotations
6. Switches to Phases view to show opening principles
7. After game completes, demonstrates Side B for comparison
8. Uses chat to answer student questions about move alternatives
9. Students see consistent strategic vocabulary across annotations
10. Coach bookmarks specific move position for next week's review

## 5. Functional Requirements

### 5.1 Archetype Quiz

**FR-1.1:** Quiz must present maximum 10 questions with Jungian/Myers-Briggs-inspired themes
**FR-1.2:** Each question must have 3-5 answer choices
**FR-1.3:** Quiz must stop early (minimum 5 questions) if confidence threshold ≥ 80% for an archetype
**FR-1.4:** User must be able to select "I'm not sure" for any question (neutral scoring)
**FR-1.5:** User must be able to skip entire quiz via explicit "Skip Quiz" button
**FR-1.6:** Result must map to one of 4 archetypes:
- Thinking/Judging (TJ): Analytical, structured, systematic
- Thinking/Perceiving (TP): Analytical, flexible, experimental
- Feeling/Judging (FJ): Intuitive, structured, goal-oriented
- Feeling/Perceiving (FP): Intuitive, flexible, creative

**FR-1.7:** Archetype result must be stored in localStorage
**FR-1.8:** User must be able to retake quiz at any time via Settings/Profile
**FR-1.9:** Annotations must subtly adapt language based on archetype (see Section 5.2.5)

### 5.2 Game Viewer

**FR-2.1:** Home screen must display library of available games with:
- Game title and opening name
- Difficulty badge (Beginner/Intermediate/Advanced)
- Tags (opening, tactics, endgame, etc.)
- Brief description

**FR-2.2:** Game selection must show overview page with:
- Full description
- Side A and Side B summaries with expected results
- Visual comparison table of key differences
- "Start Side A" and "Start Side B" buttons

**FR-2.3:** Game viewer must display:
- Interactive chessboard showing current position
- Move list with ply numbers (1, 2, 3...)
- Current move highlighted
- Navigation controls: Previous, Next, First, Last
- Keyboard shortcuts: Arrow keys for navigation, Home/End for first/last

**FR-2.4:** Clicking any move in move list must jump to that position
**FR-2.5:** Board must render correctly for both perspectives (White/Black to move)
**FR-2.6:** Move list must show Standard Algebraic Notation (SAN)

**FR-2.7:** Each move must display annotation panel with:
- Principle tag (e.g., "Center Control", "King Safety")
- Explanatory text (2-4 sentences)
- Archetype-adapted language (subtle emphasis changes)

**FR-2.8:** Viewer must indicate current side (Side A or Side B) with visual badge
**FR-2.9:** User must be able to switch between Side A and Side B without returning to overview
**FR-2.10:** URL must include query parameters for current position (deep linking): `?game=id&side=A&move=12`

### 5.3 Phases Viewer

**FR-3.1:** Phases tab must show game segmented into 3 phases:
- Opening
- Middlegame
- Endgame

**FR-3.2:** Each phase must display:
- Phase name and move range (e.g., "Opening: Moves 1-12")
- Phase overview text (3-5 sentences)
- Visual timeline showing current position within phase

**FR-3.3:** Phases must be side-specific (Side A and Side B have different segmentation)
**FR-3.4:** User must be able to click phase to jump to its starting move
**FR-3.5:** Current phase must be highlighted based on active move
**FR-3.6:** Games that end early (miniatures) must show "Not reached" for unused phases

### 5.4 Chat Component

**FR-4.1:** Chat interface must include:
- Message input textarea
- Send button
- Message history showing user and assistant messages
- Loading indicator during response generation

**FR-4.2:** MVP must use local knowledge base provider (no external API keys required)
**FR-4.3:** Knowledge base must answer questions about:
- Principles mentioned in annotations (Center Control, King Safety, Tempo, etc.)
- General chess concepts (tactics, strategy, opening principles)
- Specific moves from current game (context-aware)

**FR-4.4:** Chat responses must include:
- Direct answer to question
- Reference to relevant principles
- Suggestion to explore specific moves or phases if applicable

**FR-4.5:** Chat must gracefully handle out-of-scope questions: "I'm focused on chess strategy and this game. Could you rephrase your question about [topic]?"

**FR-4.6:** Chat must maintain context of current game and position (send game ID and move number with queries)

**FR-4.7:** Architecture must support future LLM swap via ChatProvider interface (see ARCHITECTURE.md)

**FR-4.8:** Chat history must persist during session but not across page reloads (stateless MVP)

### 5.5 Archetype-Adapted Language

Annotations should subtly emphasize different aspects based on archetype:

| Archetype | Emphasis | Example Adaptation |
|-----------|----------|-------------------|
| TJ (Thinking/Judging) | Logical patterns, systematic approach, clear rules | "This move follows the principle: develop before attacking. By completing minor piece development first, White ensures..." |
| TP (Thinking/Perceiving) | Flexibility, experimentation, multiple options | "Several moves work here, but this one maintains flexibility. Notice how White keeps options for both d4 and ...Nbd2..." |
| FJ (Feeling/Judging) | Goal-oriented narratives, purpose, clear outcomes | "The goal here is king safety. By castling now, Black achieves a secure king position and can focus on..." |
| FP (Feeling/Perceiving) | Intuition, creativity, dynamic flow | "Feel how the position flows after this move. The pieces coordinate naturally, and Black's setup invites creative central breaks..." |

**FR-5.1:** Adaptation must be subtle—annotations remain accurate for all users
**FR-5.2:** Core strategic content must be identical; only emphasis/framing differs
**FR-5.3:** Users who skip quiz receive neutral language (balanced approach)

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-1.1:** Initial page load must complete in < 3 seconds on 3G connection
**NFR-1.2:** Move navigation must respond in < 100ms (no perceived lag)
**NFR-1.3:** Board rendering must complete in < 50ms per position
**NFR-1.4:** Chat responses (local KB) must return in < 500ms
**NFR-1.5:** Application bundle size must be < 500KB gzipped (excluding images)

### 6.2 Accessibility

**NFR-2.1:** Must meet WCAG 2.1 Level AA standards
**NFR-2.2:** All interactive elements must be keyboard accessible
**NFR-2.3:** Must support screen readers with proper ARIA labels
**NFR-2.4:** Color contrast ratios must meet 4.5:1 for text, 3:1 for UI components
**NFR-2.5:** Chess board must include piece descriptions for screen readers
**NFR-2.6:** Move list must be navigable via keyboard with focus indicators
**NFR-2.7:** Must support browser zoom up to 200% without breaking layout

### 6.3 Browser Support

**NFR-3.1:** Must support:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**NFR-3.2:** Mobile responsive design for viewports ≥ 375px width
**NFR-3.3:** Graceful degradation for older browsers (display warning, basic functionality)

### 6.4 Security

**NFR-4.1:** No sensitive data collection (no PII beyond optional archetype preference)
**NFR-4.2:** localStorage data must not include identifiable information
**NFR-4.3:** No external API calls that could leak user behavior (local KB only for MVP)
**NFR-4.4:** Content Security Policy must prevent XSS attacks
**NFR-4.5:** HTTPS enforced for all production deployments (Azure Static Web Apps default)

### 6.5 Reliability

**NFR-5.1:** Application must handle invalid URL parameters gracefully (redirect to valid state)
**NFR-5.2:** Must display error boundaries for React component failures
**NFR-5.3:** Chat must handle empty responses or KB failures with user-friendly messages
**NFR-5.4:** Board rendering must handle corrupted game data without crashing

### 6.6 Maintainability

**NFR-6.1:** Code must use TypeScript with strict mode enabled
**NFR-6.2:** Components must follow single responsibility principle
**NFR-6.3:** All functions handling chess logic must be pure and unit testable
**NFR-6.4:** CSS must use consistent naming convention (BEM or CSS Modules)
**NFR-6.5:** Configuration must be environment-based (dev/staging/prod)

## 7. Data Model & Content Authoring Format

### 7.1 JSON Schema

Game data must conform to the following structure (see `/src/data/sample-games.json` for examples):

```typescript
interface GameDatabase {
  schemaVersion: string; // "1.0"
  games: Game[];
}

interface Game {
  id: string; // URL-safe identifier (kebab-case)
  title: string;
  opening: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[]; // e.g., ["opening", "tactics", "king-safety"]
  description: string; // 2-3 sentences
  sides: {
    A: GameSide;
    B: GameSide;
  };
}

interface GameSide {
  label: string; // e.g., "Side A (Attack succeeds quickly)"
  result: "1-0" | "0-1" | "1/2-1/2"; // Standard chess result notation
  pgn: string; // Full PGN move text
  annotations: Annotation[];
  phases: Phase[];
}

interface Annotation {
  ply: number; // Half-move number (1-indexed)
  san: string; // Standard Algebraic Notation (e.g., "Nf3", "O-O", "Qxf7#")
  principle: string; // e.g., "Center Control", "King Safety"
  text: string; // 2-4 sentences of explanation
}

interface Phase {
  name: "Opening" | "Middlegame" | "Endgame";
  fromPly: number; // Inclusive
  toPly: number; // Inclusive
  overview: string; // 3-5 sentences
}
```

### 7.2 Data Validation Rules

**DV-1:** All PGN strings must be legal chess moves (validated via chess.js during testing)
**DV-2:** Ply numbers must be sequential and match PGN move count
**DV-3:** Phase ranges must not overlap and must cover all moves in the game
**DV-4:** Side A and Side B must start with identical first move (1. e4)
**DV-5:** Game IDs must be unique within the database
**DV-6:** Tags must come from predefined list (extensible via ADR process)

### 7.3 Content Authoring Guidelines

- Annotations should average 2-4 sentences (50-120 words)
- Principles should be capitalized and come from standard list
- Overview text should contextualize the phase, not repeat move-by-move annotations
- Side A and Side B descriptions should clearly state the strategic outcome
- Games should demonstrate a clear strategic theme (not just random moves)
- Miniatures (games < 20 moves) are acceptable for tactical demonstrations
- Endgame phases may show "Not reached in this miniature" for very short games

## 8. UI/UX Requirements

### 8.1 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Game library + quiz entry point |
| `/quiz` | Quiz | Archetype questionnaire |
| `/game/:gameId` | GameViewer | Main game interface (redirects to Side A by default) |
| `/game/:gameId?side=A&move=12` | GameViewer | Deep-linked position |
| `/settings` | Settings | Retake quiz, view archetype, about |

**Note:** Hash routing (#/) is acceptable for static hosting compatibility.

### 8.2 Layout

**Header:**
- Logo/Title: "Boardside Chess Coach"
- Navigation: Home, Settings
- Archetype badge (subtle indicator, e.g., "TJ" icon)

**Game Viewer Layout (Desktop):**
```
+------------------------------------------+
|  Header                                  |
+------------------------------------------+
| Sidebar          | Main Content          |
| (Move List)      | +------------------+  |
|                  | | Chess Board      |  |
| 1. e4            | +------------------+  |
| 2. e5            |                       |
| 3. Nf3 ←         | [< Prev] [Next >]     |
| 4. Nc6           |                       |
|                  | Annotation Panel      |
|                  | Principle: ...        |
|                  | Text: ...             |
|                  |                       |
+------------------+-----------------------+
| Tabs: [Game] [Phases] [Chat]            |
+------------------------------------------+
```

**Mobile Layout:**
- Board stacked above move list
- Tabs for switching between Move List, Phases, Chat
- Collapsible annotation panel

### 8.3 Interactions

**Chess Board:**
- Read-only (no drag-and-drop in MVP)
- Pieces rendered with clear, accessible SVG or Unicode
- Square coordinates visible on hover (optional)
- Board orientation always White at bottom (MVP simplification)

**Move List:**
- Scrollable with current move auto-scrolled into view
- Click to jump to position
- Highlight current move with distinct background color
- Show move numbers: `1. e4 e5 2. Nf3 Nc6`

**Navigation:**
- Arrow buttons (Previous/Next) always visible
- Keyboard shortcuts enabled globally when viewer focused
- Disabled state for Previous (at start) and Next (at end)

**Side Switcher:**
- Toggle button: "Switch to Side A" / "Switch to Side B"
- Displays modal confirmation: "Switching sides will reset to move 1. Continue?"
- Preserves game context (same game ID)

**Phases Timeline:**
- Visual progress bar showing 3 phases
- Current phase highlighted
- Clickable to jump to phase start
- Shows move range: "Opening (1-12)"

**Chat:**
- Auto-scroll to latest message
- "Send" button disabled while waiting for response
- Loading indicator: "Thinking..." with animated dots
- Character limit: 500 characters per message

### 8.4 Error States

**No JavaScript:**
- Display static message: "This application requires JavaScript. Please enable it in your browser."

**Invalid Game ID:**
- Redirect to home with toast: "Game not found. Please select from the library."

**Invalid URL Parameters:**
- Sanitize and redirect to nearest valid state (e.g., move=999 → last move)

**Chat Failure:**
- Display: "I'm having trouble responding right now. Please try again."
- Retry button available

**Board Rendering Error:**
- Display static chessboard with error message
- "Report Issue" link to GitHub issues (future)

## 9. Testing Strategy

### 9.1 Unit Tests

**UT-1:** Chess domain logic
- Move validation (integrate chess.js)
- Position parsing from PGN
- Ply-to-move conversion
- Phase boundary calculations

**UT-2:** Utility functions
- URL parameter parsing
- Archetype calculation from quiz answers
- Language adaptation selector

**UT-3:** Local knowledge base
- Query parsing
- Response generation
- Fallback handling

### 9.2 Integration Tests

**IT-1:** Quiz flow
- Complete quiz → store result → apply to annotations
- Early termination at confidence threshold
- Skip quiz → neutral archetype

**IT-2:** Game viewer
- Load game → navigate moves → annotations update
- Side switch → reset position → load Side B data
- Deep link → restore position

**IT-3:** Phases view
- Display phase timeline → click phase → jump to move
- Current phase highlights correctly

**IT-4:** Chat integration
- Send message → receive response → display in history
- Context awareness (game ID and move)

### 9.3 Data Validation Tests

**DVT-1:** Validate all PGN strings in sample-games.json are legal
**DVT-2:** Verify ply numbers match move count
**DVT-3:** Check phase ranges cover all moves without gaps
**DVT-4:** Ensure Side A and Side B share first move

### 9.4 Accessibility Tests

**AT-1:** Keyboard navigation (Tab, Arrow keys, Enter/Space)
**AT-2:** Screen reader compatibility (test with NVDA/VoiceOver)
**AT-3:** Color contrast validation (automated tool)
**AT-4:** Zoom to 200% (manual test)

### 9.5 Visual Regression Tests

**VRT-1:** Chessboard rendering across positions
**VRT-2:** Responsive layouts (375px, 768px, 1920px)
**VRT-3:** Dark mode (if implemented)

### 9.6 End-to-End Tests

**E2E-1:** Complete user journey for Alex persona
**E2E-2:** Complete user journey for Maya persona
**E2E-3:** Deep link sharing and restoration

## 10. CI/CD Requirements

### 10.1 GitHub Actions Workflow

**CI-1:** Trigger on:
- Push to main branch
- Pull requests to main

**CI-2:** Build pipeline steps:
1. Checkout code
2. Install dependencies (npm ci)
3. Run linter (ESLint)
4. Run type checker (TypeScript strict mode)
5. Run unit tests (Jest)
6. Run data validation tests
7. Build production bundle
8. Run bundle size check (fail if > 500KB gzipped)

**CI-3:** Deployment pipeline (main branch only):
1. Build production assets
2. Deploy to Azure Static Web Apps
3. Run smoke tests against deployed URL
4. Post deployment status to commit

**CI-4:** Pull request workflow:
1. Run all CI checks
2. Deploy to preview environment (Azure SWA preview URL)
3. Comment on PR with preview link
4. Require all checks to pass before merge

### 10.2 Azure Static Web Apps Configuration

**AZ-1:** Use `staticwebapp.config.json` for:
- Route configuration (SPA fallback to index.html)
- HTTP headers (CSP, security headers)
- Custom error pages (404 → index.html)

**AZ-2:** Environment variables:
- `VITE_ENV` (dev, staging, production)
- `VITE_ANALYTICS_ENABLED` (false for MVP)

**AZ-3:** No API functions required for MVP (future: LLM integration)

### 10.3 Quality Gates

**QG-1:** Code coverage minimum: 70% for domain logic
**QG-2:** TypeScript strict mode: no `any` types without explicit comment
**QG-3:** ESLint: zero errors (warnings acceptable with documented exceptions)
**QG-4:** Accessibility: Lighthouse score ≥ 90
**QG-5:** Performance: Lighthouse score ≥ 85
**QG-6:** Bundle size: < 500KB gzipped

## 11. Observability & Telemetry

### 11.1 MVP Approach (Minimal)

**OBS-1:** Console error logging
- Log all unhandled errors to console
- Include structured context (component, action, user state)

**OBS-2:** Optional Application Insights stub
- Create placeholder AppInsights configuration
- Document integration steps in README
- Default: disabled (no tracking for MVP)

**OBS-3:** Local development logging
- Verbose logging in dev mode
- Suppress in production builds

### 11.2 Error Tracking (Future)

Post-MVP considerations documented for ADR:
- Sentry or similar error tracking
- User session replay (privacy-conscious)
- Performance monitoring (real user monitoring)

### 11.3 Analytics (Out of Scope for MVP)

Explicitly excluded but architecturally planned:
- Page view tracking
- User interaction events (clicks, navigation)
- Quiz completion rates
- Chat query patterns

## 12. Acceptance Criteria

The MVP is complete when all of the following are true:

### 12.1 Functional Completeness

- [ ] User can take adaptive quiz (5-10 questions) and receive archetype
- [ ] User can skip quiz and proceed with neutral archetype
- [ ] User can browse game library with titles, difficulties, and descriptions
- [ ] User can select a game and view Side A/Side B comparison
- [ ] User can navigate game move-by-move with Previous/Next buttons
- [ ] User can navigate via keyboard (arrow keys)
- [ ] User can click move list to jump to position
- [ ] Each move displays annotation with principle and explanation text
- [ ] Annotations subtly adapt based on user archetype
- [ ] User can switch between Side A and Side B
- [ ] User can view Phases tab with Opening/Middlegame/Endgame segmentation
- [ ] User can click phase to jump to its starting move
- [ ] User can use chat to ask questions about the game
- [ ] Chat responds using local knowledge base (no API keys)
- [ ] URL includes game ID, side, and move number for deep linking
- [ ] Shared URLs restore exact position

### 12.2 Data Quality

- [ ] At least 2 complete games in sample-games.json (already present)
- [ ] All PGN moves are legal and playable
- [ ] All annotations reference valid principles
- [ ] Phase boundaries are logical and complete

### 12.3 Technical Quality

- [ ] TypeScript strict mode enabled with no `any` types (except documented)
- [ ] Unit tests cover ≥ 70% of domain logic
- [ ] Data validation tests confirm PGN legality
- [ ] All CI checks pass (lint, type-check, test, build)
- [ ] Bundle size < 500KB gzipped
- [ ] Application builds successfully via `npm run build`
- [ ] Application runs locally via `npm run dev`

### 12.4 Accessibility

- [ ] Lighthouse accessibility score ≥ 90
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader can navigate game and read annotations
- [ ] Color contrast meets WCAG AA standards
- [ ] Application works at 200% zoom

### 12.5 Deployment

- [ ] Application deploys to Azure Static Web Apps
- [ ] HTTPS enabled by default
- [ ] SPA routing works (refresh on /game/:id)
- [ ] Preview deployments work for pull requests

### 12.6 Documentation

- [ ] README.md includes setup instructions
- [ ] README.md includes development commands
- [ ] README.md includes deployment instructions
- [ ] ADRs document all major architectural decisions
- [ ] ARCHITECTURE.md describes system design
- [ ] BACKLOG.md lists all implementation tasks

### 12.7 User Experience

- [ ] Initial page load < 3 seconds on 3G
- [ ] Move navigation feels instant (< 100ms)
- [ ] Chat responses return in < 500ms
- [ ] Application is responsive on mobile (≥ 375px)
- [ ] Error states display helpful messages (not technical jargon)

---

## 13. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-19 | Initial specification for Phase 0 review |

---

## 14. Approval

This specification is ready for Phase 0 review. Upon approval, implementation (Phase 1) will begin strictly according to this document. Any changes during implementation will require an ADR and updates to this SPEC.md.
