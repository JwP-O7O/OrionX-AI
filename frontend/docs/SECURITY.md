# OrionX-AI — Security Policy & Threat Model

## 1. Absolute Invariants

1. **Zero Secret Leakage**: No API credentials, master encryption keys, or private tokens may ever be emitted into browser bundles, console streams, or persistent git history.
2. **Boundary-Only Secrets**: Core business and agent logic must never invoke `process.env` or `os.getenv` directly. All configurations flow through `ConfigurationManager` and `SecretsManager`.
3. **No Unauthenticated Execution**: Every agent invocation requires an authorized correlation token and verified tenant context.
4. **Policy-Gated Autonomy**: High-risk operations (financial modifications, production code merges, public review responses to 1-2 star complaints) require automated Critic verification or explicit human approval.

## 2. Threat Model Matrix

| Threat Category | Potential Attack Vector | OrionX Mitigation Strategy |
|---|---|---|
| **Secret Compromise** | Committed keys, frontend proxy headers | All client-side headers eliminated; runtime `SecretRedactor` masks keys. |
| **Cross-Tenant Access** | Tenant ID parameter tampering | Server-side `TenantResolver` asserts authenticated tenant boundary. |
| **Model Cost Exhaustion** | Recursive swarm loops | Strict `max_depth` (5), timeout guards, token budgets & circuit breaker. |
| **Prompt Injection** | Malicious customer review payloads | Input sanitization, strict JSON response schema, Critic QA verification. |
| **Unsafe Self-Modification** | Rogue agent modifying codebase | Sandboxed adversarial test validation; human approval gate for core specs. |

## 3. Incident Response & Key Rotation Protocol

1. **Revoke**: Immediately invalidate compromised credentials in cloud consoles (GCP/OpenAI/Stripe).
2. **Rotate**: Inject rotated keys into secret vault.
3. **Quarantine**: Isolate any agent that emitted authentication errors into `QUARANTINED` status.
4. **Audit**: Trace execution chains via `correlation_id` across `system_journal/AUDIT_TRAIL.jsonl`.
