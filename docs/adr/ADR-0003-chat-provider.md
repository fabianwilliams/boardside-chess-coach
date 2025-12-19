# ADR-0003: ChatProvider Architecture and LLM Integration Strategy

**Status:** Proposed
**Date:** 2025-12-19
**Deciders:** Engineering Team
**Context:** Phase 0 - Specification
**Related:** ADR-0001 (Tooling)

---

## Context

The Boardside Chess Coach MVP includes a chat component that answers questions about:
- Chess principles mentioned in game annotations
- Strategic concepts (tempo, space, initiative, etc.)
- Specific moves from the current game

### Key Requirements

1. **MVP must work without external API keys** (no OpenAI, Azure OpenAI, etc.)
2. **Future extensibility:** Architecture must support swapping to LLM integration post-MVP
3. **Context awareness:** Chat must know current game, side (A/B), and move position
4. **Response quality:** MVP responses should be helpful, even if less sophisticated than LLM
5. **Performance:** Responses should be fast (<500ms for MVP, <3s for LLM)

### Architectural Challenge

How do we build a chat component that:
- Works immediately without API keys
- Can be upgraded to LLM without refactoring UI components
- Provides acceptable UX in both MVP and LLM modes

We must decide between:
1. **MVP-only approach:** Build simple keyword-based chat, rebuild later for LLM
2. **Abstraction approach:** Define ChatProvider interface, swap implementations
3. **Hybrid approach:** Use retrieval-augmented generation (RAG) with local embeddings
4. **Deferred approach:** Skip chat in MVP, add in Phase 2

---

## Decision

**Use ChatProvider Interface with Swappable Implementations**

### Architecture

```typescript
// src/providers/ChatProvider.ts (interface)
export interface ChatProvider {
  sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse>;
}

export interface GameContext {
  gameId: string;
  side: 'A' | 'B';
  currentPly: number;
  currentPosition: string; // FEN notation
  currentAnnotation?: Annotation; // Current move's annotation
}

export interface ChatResponse {
  text: string;
  error?: string;
  sources?: string[]; // Optional: references to principles or moves
}
```

### MVP Implementation: LocalKnowledgeBaseProvider

```typescript
// src/providers/LocalKnowledgeBaseProvider.ts
export class LocalKnowledgeBaseProvider implements ChatProvider {
  private knowledgeBase: KnowledgeBase;

  constructor(knowledgeBase: KnowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  async sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse> {
    // 1. Normalize and tokenize user message
    const tokens = this.tokenize(message.toLowerCase());

    // 2. Search knowledge base for matches
    const matches = this.searchKnowledgeBase(tokens, context);

    // 3. Rank by relevance
    const bestMatch = this.rankMatches(matches);

    // 4. Generate response with game context
    if (bestMatch) {
      return {
        text: this.formatResponse(bestMatch, context),
        sources: bestMatch.sources
      };
    }

    // 5. Fallback for unmatched queries
    return {
      text: "I'm focused on chess strategy and this game. Could you rephrase your question about chess principles, moves, or concepts?",
      error: "no_match"
    };
  }

  private tokenize(message: string): string[] {
    // Remove punctuation, split on whitespace
    return message.replace(/[^\w\s]/g, '').split(/\s+/);
  }

  private searchKnowledgeBase(tokens: string[], context: GameContext): Match[] {
    const matches: Match[] = [];

    // Search principles (exact and partial matches)
    for (const [principle, data] of Object.entries(this.knowledgeBase.principles)) {
      const score = this.calculateMatchScore(tokens, principle, data);
      if (score > 0) {
        matches.push({ type: 'principle', key: principle, data, score });
      }
    }

    // Search concepts
    for (const [concept, data] of Object.entries(this.knowledgeBase.concepts)) {
      const score = this.calculateMatchScore(tokens, concept, data);
      if (score > 0) {
        matches.push({ type: 'concept', key: concept, data, score });
      }
    }

    // Search FAQ
    for (const faq of this.knowledgeBase.faq) {
      const score = this.calculateFAQScore(tokens, faq.question);
      if (score > 0) {
        matches.push({ type: 'faq', data: faq, score });
      }
    }

    // Check if query is about current move
    if (this.isMoveQuery(tokens, context)) {
      matches.push(this.createMoveContextMatch(context));
    }

    return matches;
  }

  private calculateMatchScore(tokens: string[], key: string, data: any): number {
    let score = 0;
    const keyTokens = key.toLowerCase().split(/\s+/);

    // Exact key match: +10 points
    if (tokens.some(t => keyTokens.includes(t))) {
      score += 10;
    }

    // Related concepts match: +5 points
    if (data.relatedConcepts) {
      for (const related of data.relatedConcepts) {
        if (tokens.includes(related.toLowerCase())) {
          score += 5;
        }
      }
    }

    // Keywords in definition: +2 points per match
    if (data.definition) {
      const defTokens = this.tokenize(data.definition);
      const commonTokens = tokens.filter(t => defTokens.includes(t));
      score += commonTokens.length * 2;
    }

    return score;
  }

  private formatResponse(match: Match, context: GameContext): string {
    let response = '';

    if (match.type === 'principle') {
      response = `**${match.key}**: ${match.data.definition}\n\n`;
      if (context.currentAnnotation?.principle === match.key) {
        response += `In this game at move ${Math.ceil(context.currentPly / 2)}, this principle is demonstrated when ${context.currentAnnotation.san} ${context.currentAnnotation.text.split('.')[0].toLowerCase()}.`;
      }
    } else if (match.type === 'concept') {
      response = `**${match.key}**: ${match.data.definition}\n\n${match.data.importance}`;
    } else if (match.type === 'faq') {
      response = match.data.answer;
    } else if (match.type === 'move_context') {
      response = `At move ${Math.ceil(context.currentPly / 2)} (${context.currentAnnotation?.san}), the principle of **${context.currentAnnotation?.principle}** is at play: ${context.currentAnnotation?.text}`;
    }

    return response;
  }
}
```

### Knowledge Base Structure

```json
// src/data/knowledge-base.json
{
  "principles": {
    "Center Control": {
      "definition": "Placing pawns and pieces in or attacking the central squares (e4, d4, e5, d5) to gain space and mobility.",
      "importance": "Control of the center allows your pieces to reach more squares and restricts your opponent's options.",
      "examples": ["e4", "d4", "Nf3", "Nc3"],
      "relatedConcepts": ["Space", "Development", "Pawn Structure"],
      "commonMistakes": [
        "Playing only on the flanks without contesting the center",
        "Allowing opponent to establish a pawn center unopposed"
      ]
    },
    "King Safety": {
      "definition": "Protecting your king from threats, typically by castling and maintaining pawn shelter.",
      "importance": "An exposed king is vulnerable to attacks and can lead to quick defeat.",
      "examples": ["O-O", "O-O-O", "h3", "g6"],
      "relatedConcepts": ["Castling", "Pawn Structure", "Initiative"],
      "commonMistakes": [
        "Delaying castling too long",
        "Weakening pawn shelter prematurely"
      ]
    }
    // ... 20+ principles total
  },
  "concepts": {
    "Tempo": {
      "definition": "A unit of time in chess, equivalent to one move. Gaining tempo means forcing your opponent to waste moves.",
      "importance": "In the opening, each tempo matters for development and initiative.",
      "relatedConcepts": ["Development", "Initiative", "Time"],
      "examples": [
        "Attacking a piece so it must move again",
        "Developing with threats"
      ]
    }
    // ... 15+ concepts
  },
  "faq": [
    {
      "question": "What is tempo?",
      "answer": "Tempo is a unit of time in chess, equivalent to one move. Gaining tempo means making a move that forces your opponent to respond, effectively 'stealing' time from their development. For example, attacking a piece that has already moved forces it to move again, giving you a tempo advantage.",
      "keywords": ["tempo", "time", "development"]
    },
    {
      "question": "When should I castle?",
      "answer": "Generally, castle early—typically by move 6-10—once you've developed your knights and bishops. Castle kingside (O-O) when it's safe and your pieces support it. Don't delay castling if your king is in the center during an open position.",
      "keywords": ["castle", "castling", "king safety", "when"]
    }
    // ... 20+ FAQ entries
  ]
}
```

### Future LLM Implementation: LLMChatProvider

```typescript
// src/providers/LLMChatProvider.ts (Phase 2)
export class LLMChatProvider implements ChatProvider {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.model = config.model || 'gpt-4';
  }

  async sendMessage(
    message: string,
    context: GameContext
  ): Promise<ChatResponse> {
    // 1. Construct system prompt with game context
    const systemPrompt = this.buildSystemPrompt(context);

    // 2. Build conversation history (if we add multi-turn)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // 3. Call LLM API
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 300
        })
      });

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        sources: this.extractSources(data)
      };
    } catch (error) {
      return {
        text: "I'm having trouble responding right now. Please try again.",
        error: error.message
      };
    }
  }

  private buildSystemPrompt(context: GameContext): string {
    const annotation = context.currentAnnotation;
    return `You are a chess coach helping students understand strategic concepts.

Current Game Context:
- Game ID: ${context.gameId}
- Side: ${context.side}
- Current move: ${Math.ceil(context.currentPly / 2)}
- Position (FEN): ${context.currentPosition}
${annotation ? `- Current move principle: ${annotation.principle}
- Explanation: ${annotation.text}` : ''}

Your role:
1. Answer questions about chess strategy and principles
2. Reference the current game position when relevant
3. Explain concepts clearly for learners
4. Keep responses concise (2-3 paragraphs max)

Focus on strategic understanding, not engine analysis or move calculations.`;
  }
}
```

### Dependency Injection in App

```typescript
// src/App.tsx
function App() {
  const chatProvider = useMemo(() => {
    if (import.meta.env.VITE_CHAT_PROVIDER === 'llm') {
      return new LLMChatProvider({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        endpoint: import.meta.env.VITE_OPENAI_ENDPOINT,
        model: 'gpt-4'
      });
    }

    // Default: Local knowledge base
    return new LocalKnowledgeBaseProvider(knowledgeBase);
  }, []);

  return (
    <ChatContext.Provider value={chatProvider}>
      <Router>
        {/* routes */}
      </Router>
    </ChatContext.Provider>
  );
}
```

---

## Alternatives Considered

### Option 1: Skip Chat in MVP

**Pros:**
- Simplifies MVP scope
- No need to build knowledge base
- Faster time to market

**Cons:**
- **Missing key differentiator:** Chat is a highlighted feature in SPEC.md
- **User expectations:** Modern chess tools have interactive help
- **Lost learning opportunity:** Can't validate knowledge base before LLM integration

**Scoring:** -40 points (missing core requirement)

### Option 2: MVP-Only Keyword Chat (No Interface)

**Pros:**
- Simpler implementation
- No abstraction overhead

**Cons:**
- **Complete rebuild required** for LLM integration
- **UI coupling:** Chat components would need refactoring
- **Technical debt:** Would violate "architect for LLM swap" requirement

**Scoring:** -25 points (fails extensibility requirement)

### Option 3: Hybrid RAG with Local Embeddings

**Pros:**
- Better quality responses than keyword matching
- More sophisticated ranking
- Closer to LLM behavior

**Cons:**
- **Bundle size:** Embeddings library adds ~50-100KB
- **Complexity:** Requires vector similarity calculations
- **Overkill:** Small knowledge base doesn't benefit from embeddings
- **Performance:** May be slower than simple keyword matching

**Scoring:** -15 points (complexity not justified)

### Option 4: ChatProvider Interface (Chosen)

**Pros:**
- **Zero refactoring** needed for LLM swap
- **Simple MVP:** Keyword matching is straightforward
- **Testable:** Mock ChatProvider for component tests
- **Standards-based:** Follows dependency inversion principle

**Cons:**
- **Abstraction overhead:** Need to define interface and implement
- **MVP responses limited:** Won't match LLM quality (acceptable trade-off)

**Scoring:** +50 points (perfectly aligns with requirements)

---

## Decision Rationale

### Quantitative Comparison

| Criteria | Weight | Skip Chat | Keyword Only | RAG Hybrid | ChatProvider |
|----------|--------|-----------|--------------|------------|--------------|
| Meets MVP req | 30% | 0/10 | 8/10 | 9/10 | 10/10 |
| Extensibility | 25% | 5/10 | 3/10 | 7/10 | 10/10 |
| Bundle size | 20% | 10/10 | 10/10 | 4/10 | 10/10 |
| Dev velocity | 15% | 10/10 | 9/10 | 5/10 | 7/10 |
| UX quality | 10% | 0/10 | 6/10 | 8/10 | 7/10 |
| **Weighted Score** | | **4.5** | **6.8** | **6.9** | **9.3** |

**Winner:** ChatProvider interface scores highest.

### Key Success Factors

1. **Requirement compliance:** SPEC.md explicitly requires "architect for LLM swap"—only ChatProvider satisfies this
2. **Zero technical debt:** LLM integration is a configuration change, not a refactor
3. **Testability:** Interface makes mocking trivial for component tests
4. **Bundle efficiency:** No unnecessary libraries for MVP

---

## Implementation Guidelines

### 1. Knowledge Base Content Creation

**MVP knowledge base must include:**
- All principles mentioned in `sample-games.json` annotations (minimum: 15)
- Common chess concepts (tempo, space, initiative, etc.)
- 20+ FAQ entries covering beginner questions

**Content quality standards:**
- Definitions: 1-2 sentences, clear and accurate
- Importance statements: Explain why the concept matters
- Examples: Concrete moves or positions
- Related concepts: Cross-reference 3-5 related topics

### 2. Search Algorithm Refinement

**Scoring weights (tunable):**
- Exact keyword match: 10 points
- Related concept match: 5 points
- Definition keyword match: 2 points per token

**Minimum score threshold:** 5 points (reject matches below this)

**Tie-breaking:** Prefer principles over concepts, concepts over FAQ

### 3. Response Quality Guidelines

**Good response format:**
```
**Principle Name**: Definition here.

[Context from current game if applicable]

[Additional explanation or examples]
```

**Avoid:**
- Technical jargon without explanation
- Responses longer than 4 sentences (keep concise)
- Claiming to "analyze" the position (we're not a chess engine)

### 4. LLM Integration Checklist (Phase 2)

When adding LLM provider:
1. Create `LLMChatProvider.ts` implementing `ChatProvider`
2. Add environment variables: `VITE_OPENAI_API_KEY`, `VITE_OPENAI_ENDPOINT`
3. Update `App.tsx` dependency injection
4. Add rate limiting (e.g., max 10 queries per minute)
5. Add cost tracking (log API usage)
6. Test with mock API first (avoid spending during development)
7. Create ADR-0006: LLM Provider Selection (GPT-4 vs Azure OpenAI vs Anthropic)

---

## Consequences

### Positive

1. **Extensibility achieved:** LLM integration requires zero refactoring
2. **MVP functional:** Local KB provides helpful responses without API keys
3. **Testable architecture:** Mock ChatProvider for reliable component tests
4. **Cost control:** No API costs during MVP phase
5. **Privacy friendly:** No user data sent to external services in MVP

### Negative

1. **MVP response quality:** Keyword matching won't match LLM sophistication (expected)
2. **Knowledge base maintenance:** Must manually curate 20+ entries (one-time cost)
3. **Limited conversational ability:** No multi-turn conversation support in MVP
4. **Ranking limitations:** Simple scoring may miss nuanced queries (acceptable for MVP)

### Neutral

1. **Abstraction overhead:** ChatProvider interface adds ~50 LOC (negligible)
2. **Testing complexity:** Must test both LocalKB and (future) LLM providers
3. **User expectations:** Some users may expect GPT-level responses (manage via UI messaging)

---

## Monitoring & Success Metrics

### MVP Phase

Track these metrics to validate approach:
1. **Response relevance:** % of queries that receive non-fallback responses (target: >70%)
2. **User engagement:** Average queries per session (baseline: expect 2-3)
3. **Fallback rate:** % of queries that hit "no match" fallback (target: <30%)

### LLM Phase (Future)

Additional metrics post-LLM integration:
1. **API costs:** Cost per session (budget: $0.05 per user session)
2. **Response time:** 95th percentile latency (target: <3s)
3. **Error rate:** % of failed API calls (target: <5%)
4. **User satisfaction:** Compare MVP vs LLM feedback (expect improvement)

### Review Triggers

Re-evaluate if:
- MVP fallback rate exceeds 50% (knowledge base too limited)
- Users consistently ask questions outside KB scope
- Team requests conversational context (multi-turn) in MVP
- LLM costs exceed $100/month in Phase 2

---

## Future Enhancements

### Phase 2: LLM Integration
- Implement `LLMChatProvider`
- Add conversation history (multi-turn chat)
- Implement streaming responses (better UX for long answers)

### Phase 3: Advanced Features
- Hybrid approach: Use KB for simple queries, LLM for complex
- User feedback loop (thumbs up/down on responses)
- Personalized responses based on archetype and query history

### Phase 4: RAG Enhancement
- Add vector embeddings for knowledge base
- Semantic search instead of keyword matching
- Fine-tune LLM on chess coaching conversations

---

## Related Decisions

- **ADR-0001:** TypeScript strict mode ensures type-safe ChatProvider interface
- **ADR-0002:** Chat state is component-local (follows state management strategy)
- **Future ADR-0006:** LLM Provider Selection (to be created in Phase 2)

---

## References

- [SOLID Principles: Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [RAG (Retrieval Augmented Generation)](https://arxiv.org/abs/2005.11401)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

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
