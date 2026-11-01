# Customer Journeys for Claude Code

For service owners and customer-experience teams. Read the CLI before answering. The database is the source of truth.

## Routing

- /journeys: Review journey ownership, overdue work and evidence gaps.
- /steps: Read the customer steps in journey order.
- /evidence: Check the source, expiry and step revision behind each finding.
- /opportunities: Read improvement decisions and their owners.
- /attention: Find overdue reviews, unassigned actions and stale evidence.
- /evidence-gaps: Find steps with no current supporting evidence.
- /priorities: Compare impact divided by effort with evidence coverage. Scores are human inputs, not predicted returns.
- /owner-load: Balance open and overdue improvements by owner.
- /outcomes: Compare first and latest measurements by metric and unit. An observed change does not establish causality.
- /compliance: Review personal evidence with missing purposes or overdue retention reviews. Read docs/compliance.md. These are reminders, not legal certification.
- /activity: Read the latest 100 changes, actors and before/after records. Use export for the full history.
- /weekly-review: Prepare Monday review from journeys, attention, priorities, owner-load and outcomes. State decisions needed and evidence gaps. Never invent progress.
- /export: Export all records and audit history. Add --file=exports/snapshot.json to write a new private file. Existing files are never overwritten.
- /help: List the commands and read the matching recipe before a change.
- /add-journey: Create a journey with its accountable owner and review date.
- /add-step: Add a customer step. Read the current sequence first.
- /update-step: Update the supplied step fields only. Changed content increments its revision and makes earlier evidence stale. Never silently revalidate evidence.
- /add-evidence: Record a real finding with a source and review date. Use de-identified summaries. Never invent an interview or source.
- /review-evidence: Record a human review of retention and permitted use. Optional --purpose updates the purpose. Withdrawal prevents decision use but does not erase personal data. Review never changes the original step revision.
- /add-opportunity: Add a proposed improvement. Impact and effort are 1 to 5, supplied by the owner.
- /log-metric: Record an actual measurement. Keep metric names and units consistent. Never infer a measurement from a claim of improvement.
- /decide: Record the operator decision, approved or rejected. Approval requires current evidence. A rejected decision can be reconsidered with a new note.
- /close-opportunity: Close an approved action only after reviewing its measurements. Current evidence and two different observation dates for the same metric and unit are required. This records completion, not proven benefit.
- /review-journey: Record a completed human journey review and its next date. Never use this merely to hide an overdue flag.
- /import: Read docs/replace-uxpressia.md. Test the export first, reconcile rows and original columns, then repeat without --dry-run under the operator instruction. Changed rows require --update after review. Never assume visual files, comments, research or approval history came across.
- /draft-review and /draft-brief: private journey documents.
- /docs and /view: branded documents and read-only snapshots.
- /customise: tested migration and CLI change.
- /new-view: read-only report from existing records.

Read the corresponding .claude/commands file. Every CLI command accepts --json. Use --actor for changes. Dry runs roll back. Never fabricate evidence, sources, measurements or decisions. Preserve original import columns and inspect mapping before updating records.

## Boundaries

Never send, publish or delete without the operator's explicit instruction. No email or messaging capability ships here. Drafts stay in drafts/. Resolve ambiguity with the operator rather than choosing a record. Never seed a live shared database. Use disposable TEST_DATABASE_URL only for tests. Read docs/compliance.md before interpreting privacy reminders. Do not call them legal certification.

All work on main. Run npm test after a functional change. New migrations are numbered, never changes to applied migrations. Read docs/operations.md before shared deployment.
