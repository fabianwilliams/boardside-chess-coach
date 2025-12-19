# ADR-0001: Tooling and Build System Selection

**Status:** Proposed
**Date:** 2025-12-19
**Deciders:** Engineering Team
**Context:** Phase 0 - Specification

---

## Context

The Boardside Chess Coach MVP requires foundational decisions about:
1. Build system and development tooling
2. Chess logic library
3. TypeScript configuration
4. Testing framework
5. CSS/styling approach

These choices impact development velocity, bundle size, maintainability, and extensibility. The application will be deployed as a static SPA on Azure Static Web Apps.

---

## Decision

### 1. Build System: **Vite**

**Choice:** Vite (vs Create React App, Webpack, Parcel)

**Rationale:**
- **Fast HMR:** Near-instant hot module replacement improves development experience
- **Modern ESM:** Native ES module support reduces bundle size
- **TypeScript support:** First-class TypeScript integration without additional configuration
- **Smaller bundles:** Tree-shaking and optimized builds produce ~30% smaller bundles than CRA
- **Active development:** Vite is actively maintained and has strong community momentum
- **Azure SWA compatibility:** Static output (`dist/`) integrates seamlessly

**Trade-offs:**
- **Configuration overhead:** More manual setup than CRA (but well-documented)
- **Plugin ecosystem:** Smaller than Webpack, but sufficient for MVP needs
- **Learning curve:** Team may need to learn Vite conventions (minimal, ~1 day)

**Alternatives considered:**
- **Create React App (CRA):** Simpler setup, but slower builds, larger bundles, and Facebook has deprioritized maintenance
- **Webpack (custom):** Maximum flexibility, but configuration complexity outweighs benefits for MVP
- **Parcel:** Zero-config appeal, but less predictable bundle sizes and smaller ecosystem

**Decision factors:**
1. Performance (dev and prod) weighted 40%
2. Bundle size weighted 30%
3. Developer experience weighted 20%
4. Ecosystem/support weighted 10%

**Winner:** Vite scored highest across all factors.

---

### 2. Chess Logic Library: **chess.js**

**Choice:** chess.js (vs @lubert/chess.ts, js-chess-engine, chessground)

**Rationale:**
- **Mature & stable:** 10+ years of development, battle-tested in production apps
- **Complete feature set:** PGN parsing, FEN generation, move validation, legal move generation
- **Lightweight:** ~50KB minified, acceptable for our 500KB budget
- **Strong TypeScript types:** Community-maintained `@types/chess.js` package
- **Wide adoption:** Large Stack Overflow and GitHub community for troubleshooting
- **No UI coupling:** Pure logic library (we'll build custom board component)

**Trade-offs:**
- **Not TypeScript-native:** Uses JS with type definitions (vs native TS libraries)
- **API design:** Some methods feel dated (e.g., mutation-based API), but manageable
- **Bundle size:** Slightly larger than minimal alternatives, but feature-complete

**Alternatives considered:**
- **@lubert/chess.ts:** TypeScript-native, modern API, but less mature (fewer edge cases tested)
- **js-chess-engine:** Includes chess engine (unnecessary for MVP), larger bundle
- **chessground:** UI-focused library (we want decoupled logic)

**Decision factors:**
1. Reliability/maturity weighted 40%
2. Feature completeness weighted 30%
3. Bundle size weighted 20%
4. TypeScript support weighted 10%

**Winner:** chess.js provides best balance of reliability and features.

---

### 3. TypeScript Configuration: **Strict Mode Enabled**

**Choice:** TypeScript strict mode with ESLint enforcement

**Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Rationale:**
- **Early error detection:** Catch type errors at compile time, not runtime
- **Code documentation:** Types serve as inline documentation for future maintainers
- **Refactoring confidence:** Safe refactoring with compiler-verified changes
- **Team scalability:** Reduces onboarding time and prevents common mistakes

**Trade-offs:**
- **Initial velocity:** Slightly slower initial development (~10-15% time overhead)
- **Learning curve:** Requires team comfort with advanced TypeScript features
- **Third-party types:** Some libraries have incomplete types (use `@types` or local declarations)

**Alternatives considered:**
- **Loose mode:** Faster initial development, but accumulates technical debt
- **Gradual typing:** Start loose, tighten later (risky: rarely happens in practice)

**Decision:** Technical debt prevention outweighs short-term velocity cost. Strict mode is standard in 2025.

---

### 4. Testing Framework: **Jest + React Testing Library + Playwright**

**Choice:** Multi-layer testing stack

**Stack:**
- **Unit/Integration:** Jest + React Testing Library
- **E2E:** Playwright
- **Data validation:** Jest with custom validators

**Rationale:**
- **Jest:** Industry standard, excellent TypeScript support, fast parallel execution
- **React Testing Library:** Encourages accessibility-focused testing, aligns with WCAG goals
- **Playwright:** Cross-browser E2E testing, reliable auto-waiting, strong Azure DevOps integration
- **Consistency:** All tools use JavaScript/TypeScript (no separate language for E2E)

**Trade-offs:**
- **Learning multiple tools:** Team must learn 3 testing frameworks (mitigated by excellent docs)
- **CI/CD time:** Playwright tests add ~5-10 minutes to pipeline (acceptable for quality)

**Alternatives considered:**
- **Vitest:** Vite-native testing (faster), but less mature than Jest, ecosystem is smaller
- **Cypress:** Popular E2E tool, but Playwright has better cross-browser support and async handling
- **Testing Library alone:** Insufficient for E2E scenarios (need full browser automation)

**Decision:** Proven stack with wide adoption reduces risk. Can migrate to Vitest post-MVP if needed.

---

### 5. CSS/Styling: **CSS Modules + CSS Variables**

**Choice:** CSS Modules for component styles, global CSS variables for theming

**Structure:**
```
src/styles/
├── globals.css          # Reset, typography, base styles
├── variables.css        # CSS custom properties (colors, spacing)
└── components/          # CSS Modules per component
    ├── ChessBoard.module.css
    └── MoveList.module.css
```

**Rationale:**
- **Scoped styles:** Automatic class name hashing prevents conflicts
- **No runtime cost:** Styles extracted at build time (unlike CSS-in-JS)
- **Accessibility-friendly:** Easy media queries for `prefers-reduced-motion`, `prefers-color-scheme`
- **Theming via variables:** Single source of truth for colors, spacing, typography
- **Standard CSS:** No proprietary syntax, designers can contribute directly

**Trade-offs:**
- **Boilerplate:** Manual imports for each component (`import styles from './Component.module.css'`)
- **No dynamic styling:** Can't compute styles at runtime (rare need in our app)
- **Learning curve:** Newer developers may prefer Tailwind's utility classes

**Alternatives considered:**
- **Tailwind CSS:** Fast development with utility classes, but large initial bundle, harder to customize for specific design
- **styled-components/Emotion:** Runtime styling with props, but adds ~15KB and runtime cost
- **Plain CSS:** Simple but risk of naming conflicts and no scoping

**Decision:** CSS Modules provide best balance of performance, maintainability, and accessibility.

---

### 6. Linting & Formatting: **ESLint + Prettier**

**Choice:** ESLint for code quality, Prettier for formatting

**Configuration:**
- **ESLint:** `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- **Prettier:** Default config with 2-space indentation, single quotes, trailing commas

**Rationale:**
- **Separation of concerns:** ESLint for logic errors, Prettier for style
- **Accessibility enforcement:** `jsx-a11y` plugin catches common WCAG violations at dev time
- **Consistency:** Auto-format on save eliminates style debates

**Trade-offs:**
- **Tooling complexity:** Two tools instead of one (but widely accepted pattern)
- **CI time:** Linting adds ~30 seconds to pipeline (negligible)

**Alternatives considered:**
- **ESLint alone:** Can enforce formatting, but slower and less opinionated than Prettier
- **Biome:** New all-in-one tool (fast), but too immature for production use

**Decision:** Industry standard combo with proven track record.

---

## Consequences

### Positive

1. **Development velocity:** Vite's HMR and TypeScript support enable rapid iteration
2. **Bundle size:** Optimized build system keeps MVP under 500KB target
3. **Code quality:** Strict TypeScript and ESLint catch bugs before production
4. **Accessibility:** Testing Library and jsx-a11y plugin enforce WCAG standards from day one
5. **Maintainability:** Modern, well-documented tools reduce onboarding time
6. **Extensibility:** Standard tools make it easy to add features (e.g., Storybook, i18n)

### Negative

1. **Initial setup cost:** ~2-3 days to configure Vite, TypeScript, ESLint, Prettier, Jest
2. **Learning curve:** Team members unfamiliar with Vite or chess.js need ramp-up time (~1 week)
3. **Dependency updates:** Must stay current with Vite and chess.js to avoid security issues
4. **chess.js limitations:** If we need advanced features (e.g., tablebase integration), may need to swap libraries

### Neutral

1. **Lock-in:** Vite and chess.js are swappable if needed (domain logic is decoupled)
2. **Team preference:** Some developers prefer CRA or Tailwind (subjective, not blocking)

---

## Implementation Notes

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:data-validation": "jest tests/data-validation",
    "type-check": "tsc --noEmit",
    "test:bundle-size": "node scripts/check-bundle-size.js"
  }
}
```

### Key Dependencies

**Production:**
- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `react-router-dom` (^6.20.0)
- `chess.js` (^1.0.0-beta.6)

**Development:**
- `vite` (^5.0.0)
- `typescript` (^5.3.0)
- `@types/react` (^18.2.0)
- `@types/chess.js` (^0.13.0)
- `eslint` (^8.55.0)
- `@typescript-eslint/parser` (^6.15.0)
- `prettier` (^3.1.0)
- `jest` (^29.7.0)
- `@testing-library/react` (^14.1.0)
- `playwright` (^1.40.0)

**Note:** Exact versions to be locked in `package-lock.json` during Phase 1 setup.

---

## Related ADRs

- ADR-0002: State Management (Context API vs Redux)
- ADR-0003: ChatProvider Architecture
- ADR-0004: Dark Mode Support (TBD)

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
