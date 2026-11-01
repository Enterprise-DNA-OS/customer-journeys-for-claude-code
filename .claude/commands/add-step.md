---
description: Add a customer step.
---

Add a customer step. Read the current sequence first.

Read the target records first. Substitute the operator's actual values for the example below. Use their name as --actor. Dates here are examples, never defaults.

```bash
npm run journeys -- add-step --journey=ONBOARD --name="Check details" --position=3 --channel=Email --action="Confirm address" --pain="Repeated questions" --actor="Operator name" --json
```

Report the saved record and any checks that prevented the change. `--dry-run` is supported on every mutation and rolls back its audit records too.
