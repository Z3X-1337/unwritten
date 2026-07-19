# Unwritten — Technical Specification

## Runtime

- Node.js 20+ ESM.
- Dependency-free HTTP server and deterministic core.
- Static browser client.
- Optional OpenAI Responses API call for GPT-5.6 Structured Outputs.

## Contracts

### Evidence source

```ts
{
  id: string;
  title: string;
  kind: string;
  text: string;
}
```

Limits: 2–8 sources, unique non-empty IDs, 8,000 characters per source.

### Candidate rule

Exactly one candidate with:

- closed `ticket.close` effect;
- exactly three bounded conditions;
- source-bound verbatim citations;
- ambiguity and conflict arrays;
- explicit `requiresHumanApproval`.

### Policy DSL

`unwritten.policy/v1` with a closed vocabulary:

- fields: refund amount, approved amount, status, manager approval and ticket status;
- effects: refund submit, refund settle and ticket close;
- operators: equality, field equality, greater-than and conditional requirement.

## Trust boundaries

- Evidence text is untrusted input.
- GPT-5.6 output is untrusted structured data.
- Citation validator checks verbatim provenance.
- Human approval is required before compilation.
- DSL validator rejects unknown fields/effects/operators.
- Generated patch is rendered for review and never executed as arbitrary source.
- Workflow effects are synthetic in-memory state changes.

## Counterexample algorithm

Breadth-first search over a closed state machine:

1. Seed three synthetic refund scenarios.
2. Explore a fixed ordered transition set.
3. Deduplicate canonical states.
4. Stop at the first state where the ticket is closed and any approved rule condition fails.
5. Return the transition list, final state, failed conditions and explored-state count.

Bound: six transitions.

## Repair verification

The guard is accepted only if all five replay cases meet expected outcomes. Unsafe expected outcome is `blocked`; legitimate expected outcome is `closed`.

## Determinism

- Canonical JSON hashing sorts object keys.
- Static artifact uses fixed approval and generated timestamps.
- No-key judge compiler returns the exact bounded candidate for the bundled evidence.
- The live GPT path uses the same validator and deterministic verifier.

## API

- `GET /api/health`
- `GET /api/example`
- `POST /api/compile`
- `POST /api/run`

Request body limit: 96 KiB.

## Security headers

- CSP restricted to self.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- no referrer.
- camera, microphone and geolocation disabled.
