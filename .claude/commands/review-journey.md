---
description: Record a completed human journey review and its next date.
---

Record a completed human journey review and its next date. Never use this merely to hide an overdue flag.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- review-journey --ref=ONBOARD --review-due=2026-12-01 --note="Service owner reviewed the map" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
