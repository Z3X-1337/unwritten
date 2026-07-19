# Build Notes

## Key product decisions

- Rejected generic security scanning, handoff validation, trace regression and mutation testing because strong public competitors already cover those categories.
- Chose the missing-spec problem because current tools normally assume the correct rule or trace is already known.
- Kept InvariantWitness as an internal engine, not the product positioning.
- Limited the release to one refund workflow and one complete proof path.
- Required verbatim evidence citations and explicit approval to avoid presenting model inference as organizational truth.
- Preserved a no-key deterministic judge path while retaining a real GPT-5.6 Structured Outputs integration.

## Current checkpoint

Core engine, tests, server, browser UI, static build and first-pass documentation are implemented. Remaining external steps are primary Codex review, GitHub publication, deployment, video and Devpost submission.
