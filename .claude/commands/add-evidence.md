---
description: Record a real finding with a source and review date.
---

Record a real finding with a source and review date. Use de-identified summaries. Never invent an interview or source.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- add-evidence --code=EV-NEW --step="Place first order" --summary="Observed dispatch confusion" --source="interview:approved-reference" --observed-on=2026-11-01 --review-due=2026-12-01 --personal=false --purpose="Improve order clarity" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
