---
description: Update the supplied step fields only.
---

Update the supplied step fields only. Changed content increments its revision and makes earlier evidence stale. Never silently revalidate evidence.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- update-step --ref="Send account documents" --pain="Repeated address questions" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
