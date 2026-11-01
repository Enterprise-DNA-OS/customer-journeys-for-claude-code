---
description: Close an approved action only after reviewing its measurements.
---

Close an approved action only after reviewing its measurements. Current evidence and two different observation dates for the same metric and unit are required. This records completion, not proven benefit.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- close-opportunity --ref=OP-DATE --note="Two dated observations reviewed" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
