# OrionX-AI — Core Runtime Architecture & Contracts

## 1. System Overview

OrionX-AI is a secure, multi-tenant, model-agnostic autonomous agent orchestration engine designed for high-margin SMB automation. The core architecture enforces strict dependency boundaries, policy verification, circuit breaker protection, and deterministic task scheduling.

```
                    USER / EXTERNAL WEBHOOK
                              │
                              ▼
                    ┌───────────────────┐
                    │  OrionX API Layer │  <-- Typed endpoint contracts
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Policy Engine   │  <-- Capability & budget check
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Task Queue     │  <-- Priority, dead-letter, DAG
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ AgentOrchestrator │  <-- Correlation ID & telemetry
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             ┌─────────────┐     ┌─────────────┐
             │AgentRegistry│     │Critic Agent │
             └──────┬──────┘     └──────┬──────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌───────────────────┐
                    │   Model Router    │  <-- Tier-1, Tier-2, Tier-3 cost optimizer
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             ┌─────────────┐     ┌─────────────┐
             │Gemini/Vertex│     │OpenAI/Custom│
             │   Adapter   │     │   Adapter   │
             └─────────────┘     └─────────────┘
```

---

## 2. Layer Definitions & Invariants

1. **Frontend View Layer (`frontend/components`)**:
   - Strictly consumes typed domain models from Application Services.
   - Contains ZERO vendor SDK calls, API keys, or raw prompt engineering logic.
   - Operates with clean clipboard fallbacks for sandboxed iframe environments.

2. **Application Service Layer (`services/geminiService.ts`)**:
   - Orchestrates domain tasks (Review Reply, Prompt Tuning, Cold Audit, Incident Self-Healing).
   - Routes every request through the centralized `ModelRouter`.

3. **Core Runtime (`services/agentOrchestrator.ts`, `services/agentRegistry.ts`, `services/policyEngine.ts`)**:
   - `PolicyEngine`: Enforces explicit permissions per agent capability (`CALL_LLM`, `WRITE_DATABASE`, `EXECUTE_REFUND`, etc.).
   - `AgentRegistry`: Maintains authoritative state, metadata, and handles quarantine of failing agents.
   - `AgentOrchestrator`: Tracks correlation chains (`request_id` -> `task_id` -> `execution_id`) and executes Critic QA verification.

4. **Model Router & Circuit Breakers (`services/modelRouter.ts`, `services/circuitBreaker.ts`)**:
   - Directs prompts according to complexity:
     - **Tier 1 Micro-Template**: Instant static interpolation (5-star no text, €0.0001).
     - **Tier 2 Fast**: Gemini 2.5 Flash for rapid tone and local SEO injection (€0.001).
     - **Tier 3 Deep**: Gemini 2.5 Flash Deep reasoning for 1-2 star complaint de-escalation (€0.005).
   - Circuit breakers guard against cascaded upstream outages with `CLOSED`, `OPEN`, and `HALF_OPEN` auto-recovery states.

5. **Secrets & Config (`services/secretsManager.ts`, `services/configurationManager.ts`)**:
   - Secrets are loaded into memory and masked from logs and responses.
   - Business code never inspects raw environment variables directly.
