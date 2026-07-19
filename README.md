# Unwritten — The Missing-Spec Compiler for AI Agents

**Find the rule nobody wrote. Prove the workflow cannot break it.**

Unwritten is an evidence-grounded developer tool for AI-agent workflows. It discovers a candidate operational rule from scattered policies, runbooks, operations notes, and prior human decisions; shows the exact evidence and contradictions behind that rule; requires explicit human approval; compiles the approved rule into a closed executable policy; finds the shortest workflow that violates it; reproduces the failure in a synthetic sandbox; generates a bounded guard; and accepts the repair only after unsafe and legitimate cases are replayed.

The OpenAI Build Week MVP focuses on one complete customer-support refund workflow:

```text
Refund policy + support runbook + operations note + historical case
                              │
                              ▼
          candidate missing rule with exact citations
                              │
                    human review and approval
                              │
                              ▼
                 unwritten.policy/v1 specification
                              │
                              ▼
           shortest executable counterexample search
                              │
                              ▼
$1,200 refund still pending + no manager approval + ticket closed
                              │
                              ▼
              generated guard + attack/utility replay
```

## Why this matters

AI agents can follow every written instruction and still fail because the rule that matters may be missing, ambiguous, or distributed across several sources. Existing policy-as-code and agent-testing tools generally assume the correct specification is already known. Unwritten targets the earlier gap: discovering a defensible candidate specification, making its provenance reviewable, and turning an approved rule into executable evidence.

Unwritten does **not** claim to recover organizational truth automatically. It proposes candidate rules, validates exact source quotations, surfaces conflicts, requires human approval, and makes only bounded claims about the supplied workflow model.

## Judge path

No account, API key, database, package installation, or external service is required.

```bash
npm start
```

Open `http://localhost:3000`, then:

1. Click **Find the missing rule**.
2. Review the three conditions, their exact citations, the ambiguous term `processed`, and the conflict between the runbook and operations note.
3. Approve the candidate rule.
4. Click **Approve rule & find counterexample**.
5. Inspect the shortest three-transition witness:
   - receive request;
   - submit refund;
   - close ticket.
6. Confirm the synthetic final state:
   - refund status: `pending`;
   - ticket status: `closed`;
   - manager approval: missing.
7. Open **Verified repair** and confirm:
   - 3/3 unsafe cases blocked;
   - 2/2 legitimate cases preserved;
   - source agents modified: `0`.

Automated verification:

```bash
npm test
npm run check
```

Expected: 13 tests pass and `dist/index.html` is regenerated.

A standalone no-server demo is generated at `dist/index.html`.

## What the engine proves

The bundled workflow contains a hidden completion rule:

```text
A refund ticket must not close unless:
1. settlement is confirmed;
2. the refunded amount matches the approved amount;
3. manager approval exists when the amount exceeds $500.
```

Unwritten finds a violating execution without asking an LLM to judge the final result. The verdict comes from deterministic state exploration and synthetic tool receipts.

Before the guard:

```text
refundAmount      = 1200
approvedAmount    = 1200
refundStatus      = pending
managerApproval   = false
ticketStatus      = closed
```

After the generated guard:

```text
pending refund                    BLOCKED
$1,200 without approval           BLOCKED
amount mismatch                   BLOCKED
$120 settled refund               PASSED
$1,200 approved + settled         PASSED
```

## GPT-5.6 integration

When `OPENAI_API_KEY` is configured, Unwritten uses the OpenAI Responses API with strict Structured Outputs to propose a candidate rule from the supplied evidence bundle.

```bash
export OPENAI_API_KEY="..."
export OPENAI_MODEL="gpt-5.6"
npm start
```

PowerShell:

```powershell
$env:OPENAI_API_KEY="..."
$env:OPENAI_MODEL="gpt-5.6"
npm start
```

The model output is treated as untrusted structured data:

- every quotation must exist verbatim in the referenced source;
- unknown fields and policy vocabulary are rejected;
- a candidate cannot compile without explicit human approval;
- GPT-5.6 does not own the pass/fail verdict;
- API requests use `store: false`.

Without a key, the judge path uses the deterministic compiler for the bundled fixture and clearly labels the active mode.

## Codex integration

Codex is the primary engineering workflow for:

- competitive research and product scoping;
- defining the evidence, approval, and claim boundaries;
- implementing the closed policy DSL and bounded state explorer;
- generating the reviewable guard and replay suite;
- building the browser experience and static judge artifact;
- writing tests and performing the final GPT-5.6 product/security review.

The optional trusted-local workflow is:

```bash
npm install @openai/codex-sdk
node scripts/codex-primary-workflow.mjs
```

Before submission, the primary Codex session must run `/feedback`; its Session ID is recorded in Devpost.

## Architecture

```text
Evidence bundle
  ├── refund policy
  ├── support runbook
  ├── operations note
  └── historical case
          │
          ▼
GPT-5.6 candidate rule miner
(or deterministic judge compiler)
          │
          ▼
provenance validator + conflict court
          │
          ▼
explicit human approval
          │
          ▼
closed unwritten.policy/v1 compiler
          │
          ▼
bounded breadth-first state exploration
          │
          ▼
minimal counterexample + synthetic receipt
          │
          ▼
Codex guard patch
          │
          ▼
unsafe replay + legitimate replay
          │
          ▼
SHA-256 attestation
```

## Repository map

```text
.
├── fixtures/
│   ├── evidence/              # policies, notes and prior decision
│   └── workflow/              # bounded refund workflow model
├── public/                    # browser judge interface
├── scripts/                   # static build and Codex workflow
├── src/
│   ├── core.mjs               # mining, policy, search, execution, repair
│   └── static-build.mjs
├── tests/core.test.mjs
├── docs/
├── server.mjs
└── vercel.json
```

## Security and claim boundary

The public demo:

- accepts only bounded evidence text;
- limits request bodies to 64 KiB;
- exposes no shell, arbitrary code execution, repository import, payment account, browser account, or network destination;
- uses synthetic refund and ticket tools entirely in memory;
- treats model output as data, never executable code;
- signs the evidence result with a deterministic SHA-256 digest;
- proves one workflow class under one bounded fixture, not universal safety.

## Development

Requires Node.js 20 or newer.

```bash
npm test
npm run check
npm start
```

## Build Week provenance

The repository retains disclosed engineering history from earlier Build Week prototypes. The submitted product was substantially redesigned around a different problem, evidence model, workflow fixture, state explorer, interface, and verification claim. See `docs/CODEX_BUILD_LOG.md` for the build record.

## License

MIT. See `LICENSE`.
