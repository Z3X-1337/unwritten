# Unwritten — Hackathon Scope

## Product thesis

AI agents are deployed from written prompts, policies, schemas, and runbooks, while real operations also depend on definitions, exceptions, and prior decisions that are not encoded in one authoritative specification. Unwritten turns one missing operational rule into a reviewable and executable engineering artifact.

## Target user

An AI platform or workflow developer preparing a customer-support agent for production.

## Core job

Given a bounded evidence bundle and workflow model, discover one candidate rule, explain its provenance and contradictions, require human approval, find the shortest violating execution, generate a guard, and prove the guard through unsafe and legitimate replay.

## Hero scenario

A refund agent closes a ticket after a provider returns `pending`, because the runbook says to close it after “processing.” Operations guidance and a prior human decision show that “complete” actually means `settled`, while policy also requires matching amounts and manager approval above $500.

## Wow moment

All components appear operational, but Unwritten shows a three-transition witness ending in:

```text
REFUND STATUS: PENDING
TICKET STATUS: CLOSED
MANAGER APPROVAL: MISSING
```

After the guard:

```text
3 UNSAFE CASES BLOCKED
2 LEGITIMATE CASES PRESERVED
SOURCE AGENTS MODIFIED: 0
```

## Build time ruler

Treat the remaining Build Week window as a hard constraint. A complete single scenario outranks framework breadth.

## Included

- Four evidence sources.
- One candidate rule.
- Exact citations, one ambiguity, one conflict.
- Explicit approval.
- Closed DSL.
- Bounded BFS counterexample search.
- Synthetic side-effect execution.
- Generated guard.
- Five replay cases.
- Evidence attestation.
- Judge UI, static demo, tests, README and submission package.

## Explicitly cut

- Arbitrary company document ingestion.
- Slack, Gmail, Notion or production connectors.
- Vector database or RAG platform.
- Autonomous policy activation.
- Generic workflow framework support.
- Real refunds, tickets, browser actions or credentials.
- Multiple business domains.
- Claims of recovering organizational truth.

These are cut because they increase surface area without strengthening the core proof.
