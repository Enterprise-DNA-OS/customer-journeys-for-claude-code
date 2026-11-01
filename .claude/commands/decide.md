---
description: Record the operator decision, approved or rejected.
---

Record the operator decision, approved or rejected. Approval requires current evidence. A rejected decision can be reconsidered with a new note.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- decide --ref=OP-DATE --decision=approved --note="Owner reviewed the evidence" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
