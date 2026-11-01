---
description: Add a proposed improvement.
---

Add a proposed improvement. Impact and effort are 1 to 5, supplied by the owner.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- add-opportunity --code=OP-NEW --step="Place first order" --name="Clear dispatch wording" --owner="Ravi" --due-on=2026-12-01 --impact=4 --effort=2 --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
