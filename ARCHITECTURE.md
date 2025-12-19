# Architecture: Boardside Chess Coach

**Version:** 1.0
**Last Updated:** 2025-12-19
**Status:** Phase 0 - Awaiting Approval

---

## 1. Overview

Boardside Chess Coach is a React single-page application (SPA) designed for static hosting on Azure Static Web Apps. The architecture emphasizes:
- **Separation of concerns**: Clear boundaries between UI, domain logic, and data
- **Future extensibility**: ChatProvider interface enables LLM integration without refactoring
- **Static deployment**: No backend API required for MVP (local knowledge base only)
- **Deep linking**: URL-based state management for shareability
- **Accessibility**: Semantic HTML and ARIA support throughout

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React Application                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │  Components  │  │  Providers  │  │  │
│  │  │             │  │              │  │             │  │  │
│  │  │ - Home      │  │ - ChessBoard │  │ - Chat      │  │  │
│  │  │ - Quiz      │  │ - MoveList   │  │ - Archetype │  │  │
│  │  │ - Game      │  │ - Phases     │  │             │  │  │
│  │  │ - Settings  │  │ - Annotation │  │             │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │         │                 │                  │        │  │
│  │         └─────────────────┼──────────────────┘        │  │
│  │                           │                           │  │
│  │                    ┌──────▼──────┐                    │  │
│  │                    │   Domain    │                    │  │
│  │                    │   Logic     │                    │  │
│  │                    │             │                    │  │
│  │                    │ - Chess     │                    │  │
│  │                    │ - Quiz      │                    │  │
│  │                    │ - Utils     │                    │  │
│  │                    └─────────────┘                    │  │
│  │                           │                           │  │
│  │                    ┌──────▼──────┐                    │  │
│  │                    │    Data     │                    │  │
│  │                    │             │                    │  │
│  │                    │ - games.json│                    │  │
│  │                    │ - quiz.json │                    │  │
│  │                    │ - kb.json   │                    │  │
│  │                    └─────────────┘                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   localStorage                        │  │
│  │  - archetypeResult: string                            │  │
│  │  - quizAnswers: number[]                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

                              │
                              │ HTTPS
                              ▼
                   ┌─────────────────────┐
                   │  Azure Static Web   │
                   │       Apps          │
                   │                     │
                   │  - Static hosting   │
                   │  - CDN delivery     │
                   │  - SSL/TLS          │
                   └─────────────────────┘
```

---

## 3. Directory Structure

```
boardside-chess-coach/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── piece-sprites.svg (optional)
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Quiz.tsx
│   │   ├── GameViewer.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── ChessBoard/
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── Square.tsx
│   │   │   └── Piece.tsx
│   │   ├── MoveList/
│   │   │   ├── MoveList.tsx
│   │   │   └── MoveItem.tsx
│   │   ├── Annotation/
│   │   │   └── AnnotationPanel.tsx
│   │   ├── Phases/
│   │   │   ├── PhaseTimeline.tsx
│   │   │   └── PhaseCard.tsx
│   │   ├── Chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── Navigation/
│   │   │   ├── Header.tsx
│   │   │   └── NavControls.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── ErrorBoundary.tsx
│   ├── domain/
│   │   ├── chess/
│   │   │   ├── ChessGame.ts
│   │   │   ├── MoveNavigator.ts
│   │   │   ├── PGNParser.ts
│   │   │   └── types.ts
│   │   ├── quiz/
│   │   │   ├── ArchetypeCalculator.ts
│   │   │   ├── QuizEngine.ts
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── urlState.ts
│   │       ├── localStorage.ts
│   │       └── languageAdapter.ts
│   ├── providers/
│   │   ├── ChatProvider.ts (interface)
│   │   ├── LocalKnowledgeBaseProvider.ts (MVP impl)
│   │   └── ArchetypeContext.tsx
│   ├── data/
│   │   ├── sample-games.json
│   │   ├── quiz-questions.json
│   │   └── knowledge-base.json
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── useKeyboardNav.ts
│   │   └── useArchetype.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components/ (CSS Modules)
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   │   ├── chess/
│   │   ├── quiz/
│   │   └── utils/
│   ├── integration/
│   │   └── flows/
│   ├── e2e/
│   │   └── scenarios/
│   └── data-validation/
│       └── validateGames.test.ts
├── docs/
│   └── adr/
│       ├── ADR-0001-tooling.md
│       ├── ADR-0002-state-management.md
│       └── ADR-0003-chat-provider.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── staticwebapp.config.json
├── SPEC.md
├── ARCHITECTURE.md (this file)
├── BACKLOG.md
├── CLAUDE.md
└── README.md
```

---

## 4. Module Boundaries

### 4.1 Pages (React Router Routes)

**Responsibility:** Top-level route components that orchestrate UI and business logic

| Page | Path | Dependencies | Purpose |
|------|------|--------------|---------|
| `Home` | `/` | GameLibrary component, ArchetypeContext | Display game library, entry to quiz |
| `Quiz` | `/quiz` | QuizEngine, ArchetypeCalculator | Player Profile questionnaire (determines archetype) |
| `GameViewer` | `/game/:gameId` | ChessGame, MoveNavigator, ChatProvider | Main game interface with tabs |
| `Settings` | `/settings` | ArchetypeContext, localStorage utils | View/manage Player Profile, retake quiz |

**Design Principles:**
- Pages should be thin orchestration layers
- Business logic lives in domain modules
- Pages consume contexts and hooks, not raw data

### 4.2 Components (Presentational & Container)

**Responsibility:** Reusable UI elements with clear props interfaces

#### 4.2.1 ChessBoard
- **Props:** `position: string (FEN), orientation: 'white' | 'black'`
- **Behavior:** Read-only board rendering
- **Accessibility:** Each piece has ARIA label (e.g., "White knight on f3")

#### 4.2.2 MoveList
- **Props:** `moves: Move[], currentPly: number, onMoveClick: (ply) => void`
- **Behavior:** Scrolls current move into view, keyboard navigable
- **Format:** `1. e4 e5 2. Nf3 Nc6` with current move highlighted

#### 4.2.3 AnnotationPanel
- **Props:** `annotation: Annotation, archetype: Archetype`
- **Behavior:** Displays principle badge and adapted text
- **Language Adaptation:** Uses `languageAdapter.adapt(text, archetype)`

#### 4.2.4 PhaseTimeline
- **Props:** `phases: Phase[], currentPly: number, onPhaseClick: (startPly) => void`
- **Behavior:** Visual timeline with clickable phase segments

#### 4.2.5 ChatInterface
- **Props:** `provider: ChatProvider, gameContext: { gameId, side, ply }`
- **Behavior:** Message list + input, handles loading states

**Separation Strategy:**
- **Presentational components:** Receive all data via props (ChessBoard, Badge, Button)
- **Container components:** Connect to contexts/hooks (GameViewer, ChatInterface)

### 4.3 Domain Logic (Pure Functions & Classes)

**Responsibility:** Core business logic independent of React

#### 4.3.1 Chess Module

**`ChessGame.ts`**
```typescript
class ChessGame {
  constructor(pgn: string);
  getCurrentPosition(): string; // Returns FEN
  getMoveAt(ply: number): Move;
  getTotalPlies(): number;
  validatePGN(): boolean;
}
```

**`MoveNavigator.ts`**
```typescript
class MoveNavigator {
  constructor(game: ChessGame);
  goToMove(ply: number): Position;
  next(): Position;
  previous(): Position;
  first(): Position;
  last(): Position;
}
```

**`PGNParser.ts`**
```typescript
function parsePGN(pgn: string): Move[];
function pgnToMoves(pgn: string): { ply: number, san: string }[];
```

**Integration:** Uses `chess.js` library for move validation and position generation

#### 4.3.2 Quiz Module

**`QuizEngine.ts`**
```typescript
class QuizEngine {
  constructor(questions: Question[]);
  getNextQuestion(answers: Answer[]): Question | null;
  shouldTerminateEarly(answers: Answer[]): boolean;
  calculateConfidence(answers: Answer[]): number; // 0-100
}
```

**`ArchetypeCalculator.ts`**
```typescript
function calculateArchetype(answers: Answer[]): Archetype;
// Returns: 'TJ' | 'TP' | 'FJ' | 'FP' | 'Neutral'

function getArchetypeDescription(archetype: Archetype): string;
```

**Algorithm:**
- Each answer scores T/F and J/P dimensions (-2 to +2)
- Cumulative scores determine quadrant
- Confidence threshold: 80% (e.g., 8/10 questions strongly T → terminate early)

#### 4.3.3 Utils

**`urlState.ts`**
```typescript
function encodeGameState(gameId: string, side: 'A' | 'B', ply: number): string;
// Returns: "?game=wayward-queen&side=A&move=12"

function decodeGameState(search: string): GameState | null;
function sanitizeGameState(state: Partial<GameState>, game: Game): GameState;
```

**`localStorage.ts`**
```typescript
function saveArchetype(archetype: Archetype): void;
function loadArchetype(): Archetype | null;
function saveQuizAnswers(answers: Answer[]): void;
function clearProfile(): void;
```

**`languageAdapter.ts`**
```typescript
function adaptAnnotation(text: string, archetype: Archetype): string;
// Subtly adjusts emphasis based on archetype (see SPEC.md Section 5.5)
```

### 4.4 Providers (Abstraction Layer)

**Responsibility:** Swappable implementations for extensibility

#### 4.4.1 ChatProvider Interface

```typescript
interface ChatProvider {
  sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse>;
}

interface GameContext {
  gameId: string;
  side: 'A' | 'B';
  currentPly: number;
  currentPosition: string; // FEN
}

interface ChatResponse {
  text: string;
  error?: string;
}
```

#### 4.4.2 LocalKnowledgeBaseProvider (MVP)

```typescript
class LocalKnowledgeBaseProvider implements ChatProvider {
  constructor(knowledgeBase: KnowledgeBase);

  async sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse> {
    // 1. Parse message for keywords (principles, moves, concepts)
    // 2. Search local JSON for relevant entries
    // 3. Format response with context awareness
    // 4. Return synchronously (wrap in Promise for interface consistency)
  }
}
```

**Knowledge Base Structure (`knowledge-base.json`):**
```json
{
  "principles": {
    "Center Control": {
      "definition": "...",
      "examples": ["e4", "d4", "Nf3"],
      "relatedConcepts": ["Space", "Development"]
    }
  },
  "concepts": {
    "King Safety": {
      "definition": "...",
      "importance": "...",
      "commonMistakes": ["..."]
    }
  },
  "faq": [
    {
      "question": "What is tempo?",
      "answer": "..."
    }
  ]
}
```

**Search Algorithm:**
- Tokenize user message
- Match against principle names, concept names, FAQ questions
- Rank by relevance (exact match > partial match > related concepts)
- Return top result with context (e.g., "In this game, the principle of X is demonstrated at move Y")

#### 4.4.3 Future: LLMChatProvider (Post-MVP)

```typescript
class LLMChatProvider implements ChatProvider {
  constructor(apiKey: string, endpoint: string);

  async sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse> {
    // 1. Construct prompt with game context and annotations
    // 2. Call Azure OpenAI or OpenAI API
    // 3. Stream or await response
    // 4. Parse and return
  }
}
```

**Swap Strategy:**
- Environment variable: `VITE_CHAT_PROVIDER=local|llm`
- Dependency injection in `App.tsx`:
  ```typescript
  const chatProvider = import.meta.env.VITE_CHAT_PROVIDER === 'llm'
    ? new LLMChatProvider(apiKey, endpoint)
    : new LocalKnowledgeBaseProvider(knowledgeBase);
  ```

### 4.5 Data Layer

**Responsibility:** Static JSON files loaded at build time

#### 4.5.1 sample-games.json
- Already exists with 2 games
- Loaded via `import games from './data/sample-games.json'`
- Validated in tests (see Section 8)

#### 4.5.2 quiz-questions.json
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "When learning a new concept, I prefer...",
      "answers": [
        { "text": "Step-by-step logical explanations", "score": { "T": 2, "J": 1 } },
        { "text": "Exploring patterns and experimenting", "score": { "T": 1, "P": 2 } },
        { "text": "Understanding the 'why' and purpose", "score": { "F": 2, "J": 1 } },
        { "text": "Intuitive feel and creative discovery", "score": { "F": 1, "P": 2 } },
        { "text": "I'm not sure", "score": {} }
      ]
    }
  ]
}
```

#### 4.5.3 knowledge-base.json
- Structure defined in Section 4.4.2
- Minimum 20 principle definitions
- Minimum 10 FAQ entries
- Covers all principles mentioned in sample-games.json annotations

---

## 5. State Management

### 5.1 URL State (Primary Source of Truth)

**Managed via:** React Router's `useSearchParams` hook

**State stored in URL:**
- `game`: Game ID (e.g., `wayward-queen-scholars-theme`)
- `side`: Side A or B (default: `A`)
- `move`: Current ply number (default: `1`)

**Example URLs:**
```
/game/wayward-queen-scholars-theme
/game/wayward-queen-scholars-theme?side=A&move=1
/game/wayward-queen-scholars-theme?side=B&move=15
```

**Benefits:**
- Shareable links
- Browser back/forward navigation
- No state loss on refresh

**Implementation:**
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const side = searchParams.get('side') || 'A';
const move = parseInt(searchParams.get('move') || '1', 10);

function goToMove(ply: number) {
  setSearchParams({ side, move: ply.toString() });
}
```

### 5.2 localStorage (Persistent User Preferences)

**Stored data:**
- `boardside_archetype`: Player Profile archetype ('TJ', 'TP', 'FJ', 'FP', or 'Neutral')
- `boardside_quiz_answers`: Array of answer indices (for retake comparison)

**Terminology:** "Player Profile" is the user-facing concept; the stored value is the archetype code. The quiz is the mechanism for determining the Player Profile.

**Why localStorage (not sessionStorage):**
- Persist across browser sessions
- User shouldn't retake quiz every visit

**Data expiry:** None for MVP (consider 90-day expiry post-MVP)

### 5.3 React Context (Cross-Component State)

**`ArchetypeContext`:**
```typescript
interface ArchetypeContextValue {
  archetype: Archetype | null;
  setArchetype: (archetype: Archetype) => void;
  resetArchetype: () => void;
}
```

**Usage:** Provides archetype to all components (AnnotationPanel, Header badge)

**Alternative considered:** Redux or Zustand (see ADR-0002)
**Decision:** Context API sufficient for MVP's limited global state

### 5.4 Component State (Local UI State)

**Examples:**
- Chat message input value
- Loading indicators
- Collapsed/expanded panels

**Rule:** If state doesn't need to persist or be shared, keep it local with `useState`

---

## 6. Key Architectural Decisions

### 6.1 Single-Page Application (SPA) vs Multi-Page

**Decision:** SPA with client-side routing
**Rationale:**
- Instant navigation between games and moves
- Deep linking via query parameters
- Simpler deployment (no server-side routing)

**Trade-off:** SEO less important for learning tool (not content discovery site)

### 6.2 Static Hosting vs Server

**Decision:** Static hosting on Azure Static Web Apps
**Rationale:**
- No backend required for MVP (local knowledge base)
- Low cost and high performance (CDN)
- Simple CI/CD pipeline

**Future path:** Add Azure Functions API for LLM integration (Phase 2)

### 6.3 Chess Library Selection

**Decision:** Use `chess.js` for move validation and position generation
**Rationale:**
- Mature, well-tested library
- Supports PGN parsing and FEN generation
- Lightweight (~50KB)

**Alternative considered:** `@lubert/chess.ts` (newer, TypeScript-first)
**Trade-off:** chess.js has wider adoption and more Stack Overflow support

**See:** ADR-0001-tooling.md for full analysis

### 6.4 Build Tool Selection

**Decision:** Vite
**Rationale:**
- Fast HMR for development
- Excellent TypeScript support
- Smaller bundle sizes than CRA
- Modern ESM-based architecture

**Alternative considered:** Create React App (CRA)
**Trade-off:** Vite requires more configuration but offers better performance

**See:** ADR-0001-tooling.md

### 6.5 Styling Approach

**Decision:** CSS Modules with global CSS variables
**Rationale:**
- Scoped styles prevent conflicts
- No runtime cost (unlike CSS-in-JS)
- Easy theming via CSS variables
- Supports accessibility (media queries for reduced motion, high contrast)

**Alternative considered:** Tailwind CSS, styled-components
**Trade-off:** CSS Modules requires more boilerplate but no build-time overhead

### 6.6 TypeScript Strict Mode

**Decision:** Enable strict mode with no implicit `any`
**Rationale:**
- Catch bugs at compile time
- Improves code documentation (types as contracts)
- Required for maintainability as team grows

**Trade-off:** Slightly slower initial development but faster debugging

---

## 7. Data Flow Diagrams

### 7.1 Game Viewer Data Flow

```
User clicks "Next Move"
         │
         ▼
   NavControls.tsx (emits: onNext)
         │
         ▼
   GameViewer.tsx (calls: goToMove(currentPly + 1))
         │
         ▼
   setSearchParams({ move: currentPly + 1 })
         │
         ▼
   URL updates → React Router re-renders
         │
         ▼
   useGameState hook (reads: searchParams.get('move'))
         │
         ▼
   MoveNavigator.goToMove(ply)
         │
         ▼
   ChessGame.getPositionAt(ply) → Returns FEN
         │
         ├─────────────────────────────┬─────────────────────┐
         ▼                             ▼                     ▼
   ChessBoard.tsx              MoveList.tsx          AnnotationPanel.tsx
   (renders position)          (highlights move)     (displays annotation)
```

### 7.2 Chat Query Data Flow

```
User types message and clicks "Send"
         │
         ▼
   MessageInput.tsx (emits: onSend)
         │
         ▼
   ChatInterface.tsx (calls: chatProvider.sendMessage)
         │
         ▼
   LocalKnowledgeBaseProvider.sendMessage(message, context)
         │
         ├─── Extract keywords from message
         │
         ├─── Search knowledge-base.json
         │         │
         │         ├─── Match principles
         │         ├─── Match concepts
         │         └─── Match FAQ
         │
         ├─── Rank results by relevance
         │
         └─── Format response with game context
         │
         ▼
   Return ChatResponse { text, error }
         │
         ▼
   ChatInterface.tsx (appends to message history)
         │
         ▼
   MessageList.tsx (renders new message)
```

### 7.3 Quiz Flow Data Flow

```
User starts quiz
         │
         ▼
   Quiz.tsx (loads: quiz-questions.json)
         │
         ▼
   QuizEngine.getNextQuestion(answers: [])
         │
         ▼
   Display Question #1
         │
         ▼
   User selects answer
         │
         ▼
   QuizEngine.shouldTerminateEarly(answers)
         │
         ├─── If confidence < 80% → Continue
         │         │
         │         ▼
         │    Display next question (up to 10)
         │
         └─── If confidence ≥ 80% → Terminate early
                     │
                     ▼
            ArchetypeCalculator.calculate(answers)
                     │
                     ▼
            saveArchetype(result) → localStorage
                     │
                     ▼
            Navigate to Home (archetype badge appears)
```

---

## 8. Testing Architecture

### 8.1 Test Pyramid

```
        ┌───────────────┐
        │  E2E Tests    │  (5-10 scenarios)
        │  Playwright   │
        └───────────────┘
              △
             ╱│╲
            ╱ │ ╲
        ┌──────────────┐
        │ Integration  │  (20-30 tests)
        │ React Testing│
        │   Library    │
        └──────────────┘
              △
             ╱│╲
            ╱ │ ╲
        ┌──────────────┐
        │  Unit Tests  │  (100-150 tests)
        │     Jest     │
        └──────────────┘
```

### 8.2 Test Organization

**Unit Tests (`tests/unit/`):**
- `chess/`: ChessGame, MoveNavigator, PGNParser
- `quiz/`: QuizEngine, ArchetypeCalculator
- `utils/`: urlState, localStorage, languageAdapter

**Integration Tests (`tests/integration/`):**
- Quiz flow (start → answer → early termination → result)
- Game viewer (load → navigate → annotations update)
- Chat integration (send → search KB → display response)

**E2E Tests (`tests/e2e/`):**
- Alex persona journey (structured learner)
- Maya persona journey (intuitive learner)
- Deep link restoration

**Data Validation Tests (`tests/data-validation/`):**
- Validate all PGN strings are legal (use chess.js)
- Verify ply numbers match move counts
- Check phase boundaries

### 8.3 Mock Strategy

**What to mock:**
- `ChatProvider` in component tests (return predictable responses)
- `localStorage` in tests (use in-memory mock)
- `chess.js` in unit tests (where possible, or use real library if lightweight)

**What NOT to mock:**
- Domain logic (ChessGame, QuizEngine) → test real implementations
- React Router → use `<MemoryRouter>` with real navigation

---

## 9. Deployment Architecture

### 9.1 Azure Static Web Apps Configuration

**File:** `staticwebapp.config.json`
```json
{
  "routes": [
    {
      "route": "/*",
      "rewrite": "/index.html"
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.json"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff"
  }
}
```

**CSP Considerations for ChessBoard:**
- `img-src 'self' data:` allows SVG sprites, data URIs, and bundled images (sufficient for most chessboard renderers)
- `style-src 'unsafe-inline'` required for CSS Modules inline styles (unavoidable in MVP)
- If chessboard rendering fails due to CSP violations, check browser console and adjust CSP minimally
- **Do not weaken CSP beyond what the renderer requires** (maintain security posture)
- Common adjustments if needed:
  - Add `blob:` to `img-src` for dynamically generated images
  - Add specific CDN domains if external piece assets are used (prefer bundled assets)

---

### 9.2 CI/CD Pipeline

**GitHub Actions Workflow (`.github/workflows/ci-cd.yml`):**
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:data-validation
      - run: npm run build
      - run: npm run test:bundle-size

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

### 9.3 Environment Configuration

**Development:**
- `npm run dev` → Vite dev server on localhost:5173
- `VITE_ENV=development`

**Staging (PR Previews):**
- Automatic deployment to Azure SWA preview URL
- `VITE_ENV=staging`

**Production:**
- Manual promotion from main branch
- `VITE_ENV=production`
- Custom domain: `boardside-chess-coach.azurewebsites.net` (or custom)

---

## 10. Security Architecture

### 10.1 Threat Model

**Threats considered:**
- XSS via unsanitized user input (chat messages)
- CSRF (not applicable: no backend API in MVP)
- Data leakage via localStorage
- Malicious game data injection

**Mitigations:**
- CSP headers (restrict inline scripts)
- React's built-in XSS protection (escapes by default)
- localStorage contains no PII
- Game data validated at build time

### 10.2 Content Security Policy

**Applied headers:**
```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  script-src 'self';
  connect-src 'self';
```

**Why `'unsafe-inline'` for styles:**
- CSS Modules generate inline styles
- Alternative: Extract all CSS at build time (TODO post-MVP)

### 10.3 Data Privacy

**No PII collected:**
- Player Profile (archetype) is pseudonymous ('TJ', 'FP', etc.)
- No usernames, emails, or identifying information
- localStorage is client-side only

**GDPR compliance:**
- No tracking or analytics in MVP
- User can clear Player Profile via Settings → Reset Profile

---

## 11. Performance Optimization

### 11.1 Bundle Splitting

**Code splitting strategy:**
- Route-based: Each page is a separate chunk
- `React.lazy()` for heavy components (ChessBoard, Chat)
- Vendor bundle separate from app code

**Expected bundles:**
- `vendor.js` (~200KB): React, React Router, chess.js
- `app.js` (~100KB): Application code
- `ChessBoard.chunk.js` (~50KB): Board rendering
- `data.js` (~100KB): games.json, quiz.json, kb.json

**Total:** ~450KB gzipped (within 500KB target)

### 11.2 Rendering Optimization

**ChessBoard:**
- Memoize piece components (`React.memo`)
- Only re-render changed squares (diff FEN strings)

**MoveList:**
- Virtualized scrolling if > 100 moves (e.g., `react-window`)
- MVP: Auto-scroll to current move without virtualization

**Annotations:**
- Precompute adapted text on game load (cache in state)

### 11.3 Data Loading

**MVP: Static Imports Only**

All game data is loaded via static import statements and bundled at build time:

```typescript
// In App.tsx or data loader module
import gamesData from './data/sample-games.json';
import quizQuestions from './data/quiz-questions.json';
import knowledgeBase from './data/knowledge-base.json';
```

**MVP Characteristics:**
- **Single JSON file per dataset:** `sample-games.json`, `quiz-questions.json`, `knowledge-base.json`
- **Bundled at build time:** Vite includes all data in the application bundle
- **No runtime fetch calls:** No `fetch()`, no `import()`, no network requests for data
- **All games in one file:** `sample-games.json` contains the complete games array (2 games in MVP)
- **Rationale:** Intentional simplification for Azure Static Web Apps reliability, CDN caching predictability, and deployment simplicity

**Post-MVP: Per-Game Lazy Loading (Future Enhancement)**

When the game library grows beyond 10-15 games, consider splitting into individual files:

```typescript
// Future pattern (NOT MVP)
const game = await import(`./data/games/${id}.json`);
```

**Trade-off:** Initial load time vs. total bundle size. For MVP with 2 games, static imports are simpler and more reliable.

---

## 12. Accessibility Architecture

### 12.1 Semantic HTML

**Structure:**
- `<main>` for primary content
- `<nav>` for header navigation
- `<article>` for game viewer
- `<aside>` for annotation panel

### 12.2 ARIA Labels

**ChessBoard:**
```html
<div role="grid" aria-label="Chess board, current position">
  <div role="row" aria-label="Rank 8">
    <div role="gridcell" aria-label="Black rook on a8">♜</div>
  </div>
</div>
```

**MoveList:**
```html
<ol role="list" aria-label="Move list">
  <li role="listitem" aria-current="step">1. e4</li>
</ol>
```

### 12.3 Keyboard Navigation

**Focus management:**
- Tab order: Header → Move list → Board → Annotation → Chat
- Arrow keys: Navigate moves (when move list focused)
- Enter: Select move (when move list item focused)
- Escape: Close modals

**Skip links:**
- "Skip to main content" link (hidden, appears on focus)

---

## 13. Extensibility & Future Considerations

### 13.1 LLM Integration (Phase 2)

**Steps to add LLM provider:**
1. Implement `LLMChatProvider` class
2. Add environment variables for API key and endpoint
3. Update dependency injection in `App.tsx`
4. Add Azure Functions API if using backend proxy (optional)
5. Update SPEC.md and create ADR for LLM choice

**No refactoring required:** ChatProvider interface already abstracts implementation

### 13.2 Additional Game Formats

**Current:** PGN string in JSON
**Future:** Support external PGN files or databases

**Extension path:**
1. Create `GameLoader` interface
2. Implementations: `JSONGameLoader` (current), `PGNFileLoader` (future)
3. Update domain layer to accept `GameLoader` dependency

### 13.3 User-Generated Content

**Post-MVP features:**
- Upload PGN files
- Create custom annotations
- Share games via unique URLs

**Architectural additions needed:**
- Backend API (Azure Functions + Cosmos DB)
- Authentication (Azure AD B2C or similar)
- Content moderation

### 13.4 Mobile Apps

**Current:** Responsive web app
**Future:** React Native mobile apps

**Shared code:**
- All domain logic (`chess/`, `quiz/`, `utils/`) is platform-agnostic
- Providers can be reused with React Native storage adapters

---

## 14. Open Questions (To Be Resolved in ADRs)

1. **Dark mode support:** Should MVP include dark mode toggle?
   - **Decision:** Create ADR-0004 during implementation
   - **Default:** Light mode only for MVP

2. **Analytics integration:** Which tool if we add analytics post-MVP?
   - **Options:** Azure Application Insights, Google Analytics, Plausible
   - **Default:** None for MVP

3. **Internationalization (i18n):** Plan for multi-language support?
   - **Decision:** English-only for MVP, plan for i18n in ADR-0005

---

## 15. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-19 | Initial architecture for Phase 0 review |

---

## 16. Approval

This architecture is ready for Phase 0 review. Upon approval, implementation will follow this design. Any architectural changes during implementation will require an ADR and updates to this document.
