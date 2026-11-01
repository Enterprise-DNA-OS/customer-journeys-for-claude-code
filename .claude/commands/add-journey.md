---
description: Create a journey with its accountable owner and review date.
---

Create a journey with its accountable owner and review date.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- add-journey --code=ACCOUNT --name="Account onboarding" --owner="Mere" --persona="Account owner" --goal="First order" --review-due=2026-12-01 --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
