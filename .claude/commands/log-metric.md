---
description: Record an actual measurement.
---

Record an actual measurement. Keep metric names and units consistent. Never infer a measurement from a claim of improvement.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- log-metric --ref=OP-DATE --name="Dispatch clarity" --value=75 --unit=percent --observed-on=2026-11-01 --source="survey:approved-reference" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
