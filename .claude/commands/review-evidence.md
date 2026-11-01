---
description: Record a human review of retention and permitted use.
---

Record a human review of retention and permitted use. Optional --purpose updates the purpose. Withdrawal prevents decision use but does not erase personal data. Review never changes the original step revision.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- review-evidence --ref=EV-OLD --state=withdrawn --review-due=2026-12-01 --note="No longer relied upon" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
