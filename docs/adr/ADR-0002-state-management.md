# ADR-0002: State Management Strategy

**Status:** Proposed
**Date:** 2025-12-19
**Deciders:** Engineering Team
**Context:** Phase 0 - Specification
**Related:** ADR-0001 (Tooling)

---

## Context

The Boardside Chess Coach MVP requires state management for:
1. **Game state:** Current position, move index, side (A/B)
2. **User profile:** Archetype result from quiz
3. **UI state:** Chat messages, loading indicators, modals
4. **Navigation state:** Current route and query parameters

Key considerations:
- State must be shareable via URLs (deep linking requirement)
- User profile must persist across browser sessions
- UI state is ephemeral (doesn't need persistence)
- Application is single-user (no real-time collaboration)
- Bundle size budget is tight (500KB total)

We must decide between:
- URL + localStorage + React Context (minimal approach)
- Redux/Redux Toolkit (centralized store)
- Zustand (lightweight store)
- Jotai/Recoil (atomic state)

---

## Decision

**Use URL State + localStorage + React Context API**

### State Distribution Strategy

| State Type | Storage Mechanism | Rationale |
|------------|------------------|-----------|
| Game position, side, move | URL query parameters | Shareable, browser history support |
| User archetype | localStorage | Persist across sessions |
| Chat messages | Component state | Ephemeral, session-only |
| Loading indicators | Component state | Local UI concern |
| Modals, dropdowns | Component state | Local UI concern |
| Archetype (in-memory) | React Context | Share across components |

### Implementation Pattern

**1. URL State (Primary Source of Truth for Game):**
```typescript
// In GameViewer.tsx
const [searchParams, setSearchParams] = useSearchParams();

const gameId = searchParams.get('game') || 'default-game';
const side = (searchParams.get('side') as 'A' | 'B') || 'A';
const currentPly = parseInt(searchParams.get('move') || '1', 10);

function goToMove(ply: number) {
  setSearchParams({ game: gameId, side, move: ply.toString() });
}
```

**Why URL state for game:**
- Deep linking: Users can share `?game=wayward-queen&side=A&move=12`
- Browser navigation: Back/forward buttons work naturally
- Stateless components: No need to sync internal state with URL
- No state loss on refresh: URL is source of truth

**2. localStorage (Persistent User Preferences):**
```typescript
// In src/domain/utils/localStorage.ts
const ARCHETYPE_KEY = 'boardside_archetype';
const QUIZ_ANSWERS_KEY = 'boardside_quiz_answers';

export function saveArchetype(archetype: Archetype): void {
  localStorage.setItem(ARCHETYPE_KEY, archetype);
}

export function loadArchetype(): Archetype | null {
  return localStorage.getItem(ARCHETYPE_KEY) as Archetype | null;
}
```

**Why localStorage:**
- Persist archetype across sessions (user shouldn't retake quiz every visit)
- No backend required (MVP constraint)
- Simple API, no serialization complexity
- Supported by all target browsers (IE11+ not required)

**3. React Context (Cross-Component Sharing):**
```typescript
// In src/providers/ArchetypeContext.tsx
interface ArchetypeContextValue {
  archetype: Archetype | null;
  setArchetype: (archetype: Archetype) => void;
  resetArchetype: () => void;
}

const ArchetypeContext = createContext<ArchetypeContextValue | undefined>(undefined);

export function ArchetypeProvider({ children }: { children: ReactNode }) {
  const [archetype, setArchetypeState] = useState<Archetype | null>(() => loadArchetype());

  const setArchetype = (newArchetype: Archetype) => {
    saveArchetype(newArchetype);
    setArchetypeState(newArchetype);
  };

  const resetArchetype = () => {
    localStorage.removeItem(ARCHETYPE_KEY);
    setArchetypeState(null);
  };

  return (
    <ArchetypeContext.Provider value={{ archetype, setArchetype, resetArchetype }}>
      {children}
    </ArchetypeContext.Provider>
  );
}
```

**Why Context API:**
- Archetype needed in multiple components (Header badge, AnnotationPanel)
- Avoids prop drilling through 3-4 component layers
- No external library needed (reduces bundle size)
- Sufficient for MVP's limited global state

**4. Component State (Local UI Concerns):**
```typescript
// In ChatInterface.tsx
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [inputValue, setInputValue] = useState('');
```

**Why component state:**
- Chat messages don't need to persist or share
- Loading indicators are local to the component
- Keeps state close to where it's used (easier to reason about)

---

## Alternatives Considered

### Option 1: Redux Toolkit

**Pros:**
- Centralized store with time-travel debugging
- DevTools for inspecting state
- Middleware for side effects (thunks)
- Widely adopted, excellent documentation

**Cons:**
- **Bundle size:** +15-20KB (5% of budget)
- **Boilerplate:** Actions, reducers, selectors (slower development)
- **Overkill:** MVP has minimal global state (just archetype)
- **Learning curve:** Team must learn Redux patterns

**Scoring:**
- Bundle size impact: -30 points
- Development complexity: -20 points
- Debugging capabilities: +15 points
- **Total: -35 points**

### Option 2: Zustand

**Pros:**
- Lightweight (~3KB, minimal bundle impact)
- Simple API, minimal boilerplate
- Built-in TypeScript support
- Doesn't require Context Provider wrapper

**Cons:**
- **Less familiar:** Smaller community than Redux or Context API
- **Debugging:** No official DevTools (community tools exist)
- **Adoption risk:** Newer library, less battle-tested
- **Unnecessary:** Context API sufficient for MVP

**Scoring:**
- Bundle size impact: -5 points
- Development complexity: +10 points
- Community support: -10 points
- **Total: -5 points**

### Option 3: Jotai/Recoil (Atomic State)

**Pros:**
- Fine-grained reactivity (optimal re-renders)
- Excellent TypeScript support
- Scales well for complex apps

**Cons:**
- **Bundle size:** +10-15KB
- **Mental model shift:** Atoms/selectors pattern unfamiliar to team
- **Overkill:** MVP doesn't have complex state dependencies
- **Recoil stability:** Still experimental (0.x version)

**Scoring:**
- Bundle size impact: -20 points
- Development complexity: -15 points
- Performance: +10 points
- **Total: -25 points**

### Option 4: URL + localStorage + Context (Chosen)

**Pros:**
- **Zero bundle cost:** All built-in APIs
- **Simple mental model:** State lives where it belongs
- **Standards-based:** URL and localStorage are web platform APIs
- **Perfect fit:** Exactly matches MVP requirements

**Cons:**
- **Manual sync:** Must manually sync localStorage with Context
- **No time-travel:** Can't replay state changes (acceptable for MVP)
- **Limited DevTools:** React DevTools only, no Redux-like inspector

**Scoring:**
- Bundle size impact: 0 points (no additional library)
- Development complexity: +20 points (simple patterns)
- Fit for requirements: +25 points (perfect match)
- **Total: +45 points**

---

## Decision Rationale

### Quantitative Analysis

| Criteria | Weight | Redux | Zustand | Jotai | URL+Context |
|----------|--------|-------|---------|-------|-------------|
| Bundle size | 30% | 2/10 | 8/10 | 5/10 | 10/10 |
| Dev velocity | 25% | 5/10 | 8/10 | 6/10 | 9/10 |
| Maintainability | 20% | 8/10 | 7/10 | 6/10 | 8/10 |
| Learning curve | 15% | 4/10 | 7/10 | 5/10 | 9/10 |
| Debugging | 10% | 10/10 | 6/10 | 7/10 | 6/10 |
| **Weighted Score** | | **5.4** | **7.4** | **6.0** | **8.9** |

**Winner:** URL + Context API scores highest across weighted criteria.

### Qualitative Factors

1. **Requirements alignment:** MVP needs shareable URLs (built-in with URL state)
2. **Simplicity:** Fewer abstractions → faster onboarding for new contributors
3. **Future flexibility:** Can add Redux/Zustand later if complexity grows (data migration is straightforward)
4. **Platform-first:** Prefer web platform APIs over libraries when sufficient

---

## Implementation Guidelines

### 1. URL State Management

**Do:**
- Use `useSearchParams()` from react-router-dom
- Sanitize and validate URL parameters (handle invalid `move=999`)
- Default to sensible values (e.g., `side=A`, `move=1`)

**Don't:**
- Store sensitive data in URL (not applicable in MVP)
- Put large data in URL (e.g., full game PGN)
- Rely on URL for ephemeral UI state (use component state)

### 2. localStorage Best Practices

**Do:**
- Prefix keys with `boardside_` to avoid conflicts
- Wrap in try/catch (localStorage can throw QuotaExceededError)
- Validate data on read (handle corrupted/missing data)

**Don't:**
- Store PII or sensitive data
- Exceed 5MB storage (we'll use <1KB)
- Assume localStorage is always available (graceful degradation)

### 3. Context API Patterns

**Do:**
- Create custom hooks (`useArchetype`) to access context
- Memoize context values to prevent unnecessary re-renders
- Split contexts by concern (ArchetypeContext, ThemeContext if needed)

**Don't:**
- Put frequently changing state in Context (causes re-render cascade)
- Nest Providers deeply (limit to 2-3 levels)
- Use Context for every piece of state (prefer local state)

### 4. When to Escalate to a Library

**Signals to add Redux/Zustand:**
- More than 5 pieces of global state
- Complex state dependencies (e.g., derived state with 3+ inputs)
- Debugging requires time-travel or state snapshots
- Team requests centralized store for consistency

**Migration path:**
- Extract state logic to custom hooks first
- Add Redux Toolkit or Zustand incrementally
- Keep URL and localStorage as-is (complementary, not replaced)

---

## Consequences

### Positive

1. **Zero bundle cost:** No additional libraries required
2. **Simple onboarding:** Team can contribute without learning new state library
3. **Perfect URL support:** Deep linking and sharing work out of the box
4. **Future-proof:** Can add Redux/Zustand later without major refactoring
5. **Standards-based:** Uses web platform APIs (more stable than libraries)

### Negative

1. **Manual syncing:** Must manually keep localStorage and Context in sync
2. **No DevTools:** Can't inspect state history like Redux DevTools
3. **Boilerplate:** Need to write localStorage utils and Context providers manually
4. **Scaling concerns:** If app grows significantly, may need to refactor to library

### Neutral

1. **Testing:** Context API requires React Testing Library (already chosen)
2. **Debugging:** React DevTools sufficient for MVP, but less powerful than Redux DevTools
3. **Team preference:** Some developers prefer Redux's explicitness (subjective)

---

## Monitoring & Review

### Success Metrics

1. **Bundle size:** Confirm no state management library added to production bundle
2. **Bug rate:** Track state-related bugs (should be low due to simple architecture)
3. **Dev velocity:** Measure time to implement new features requiring state

### Review Triggers

Re-evaluate this decision if:
- State-related bugs exceed 20% of total bugs
- Team requests centralized store in 3+ retrospectives
- We add 5+ new pieces of global state (Phase 2 features)
- URL state becomes unwieldy (e.g., > 10 query parameters)

### Potential Amendments

| Scenario | Solution |
|----------|----------|
| Too many Context Providers | Introduce Zustand for some state |
| URL too complex | Move some params to localStorage with expiry |
| Debugging difficult | Add Redux DevTools Extension support |
| State bugs frequent | Add TypeScript state machine (XState) |

---

## Related Decisions

- **ADR-0001:** TypeScript strict mode ensures type-safe state management
- **ADR-0003:** ChatProvider state is component-local (follows this pattern)
- **Future ADR-0004:** Dark mode preference will use localStorage (consistent with archetype)

---

## References

- [React Context API Docs](https://react.dev/reference/react/useContext)
- [React Router useSearchParams](https://reactrouter.com/en/main/hooks/use-search-params)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [When to use Context vs Redux](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)

---

## Review & Approval

**Reviewers:** [To be assigned]
**Approved by:** [To be filled during Phase 0 review]
**Date:** [To be filled upon approval]

---

## Amendments

| Date | Change | Rationale |
|------|--------|-----------|
| 2025-12-19 | Initial version | Phase 0 specification |
