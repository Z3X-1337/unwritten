# Codex Build Log

## Product convergence

The project began with agent skill composition security. Competitive research identified strong adjacent projects in repository scanning, boundary testing, trace regression, workflow contracts and agent mutation testing. The product was reframed around the earlier missing layer: discovering an operational specification that was never encoded.

## Codex contributions

Codex was used to:

- compare competing product units rather than merely compare names;
- preserve the strongest parts of the prior engine: closed IR, deterministic verdicts, synthetic receipts, replay and attestation;
- design the evidence → approval → policy → counterexample → repair chain;
- implement the deterministic core and browser experience;
- split the core into reviewable contracts, mining, policy, workflow, repair, and run modules;
- create strict tests for provenance, approval, search minimality, state observation and utility preservation;
- constrain the public demo to bounded text and in-memory effects;
- prepare the final review prompt and submission package.

## Authority split

- GPT-5.6 proposes semantics and citations.
- The human approves or rejects the candidate rule.
- Deterministic code validates provenance, compiles policy, searches states and decides pass/fail.
- Codex proposes a repair and verifies it through the deterministic harness.

## Final review requirement

Run:

```bash
node scripts/codex-primary-workflow.mjs
```

Execute the resulting prompt in the primary Codex GPT-5.6 session. Make one bounded improvement, rerun `npm run check`, use `/feedback`, and store the Session ID in the submission checklist.
