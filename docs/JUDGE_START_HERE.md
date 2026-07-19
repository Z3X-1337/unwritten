# Judge Start Here

## 60-second path

```bash
npm start
```

Open `http://localhost:3000`.

1. Click **Find the missing rule**.
2. Confirm every condition includes exact evidence and that `processed` is marked ambiguous.
3. Approve the candidate rule.
4. Click **Approve rule & find counterexample**.
5. Confirm the shortest witness is:
   - receive request;
   - submit refund;
   - close ticket.
6. Confirm the observed state is `pending + closed + missing approval`.
7. Open **Verified repair**.
8. Confirm 3/3 unsafe cases are blocked and 2/2 legitimate cases are preserved.

## Automated path

```bash
npm test
npm run check
```

Expected: 13 tests pass and `dist/index.html` is generated.

## Static path

Open `dist/index.html` directly. It contains the complete staged judge demo and requires no server or key.

## Claim boundary

Unwritten does not claim automatic recovery of organizational truth. It proposes a candidate rule, binds it to exact evidence, surfaces conflict, requires explicit human approval, and then provides bounded executable evidence for the approved rule.
