---
description: Read docs/replace-uxpressia.
---

Read docs/replace-uxpressia.md. Test the export first, reconcile rows and original columns, then repeat without --dry-run under the operator instruction. Changed rows require --update after review. Never assume visual files, comments, research or approval history came across.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- import uxpressia --file=fixtures/uxpressia.csv --source=first-export --journey=IMPORTED --dry-run --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
