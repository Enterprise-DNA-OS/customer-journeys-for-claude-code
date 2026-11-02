# Customer Journeys for Claude Code

Your customer steps, supporting evidence and improvement decisions in a database you own. Find the promises that have no proof and the actions that have no owner.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install and run the demo. | Your journey fields, export mapping and review rules. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=uxpressia) · [Instead of UXPressia](https://enterprisedna.co/omni/instead-of/uxpressia?utm_source=github&utm_medium=readme&utm_campaign=uxpressia)

## Start with the Monday review

Node 20 or later.

```bash
npm install
npm run demo
npm run journeys -- weekly-review
npm run docs
npm run view
```

Open the folder in Claude Code, Codex, OpenCode or Cursor. Every runtime reads the same commands. PGlite runs locally without a server. DATABASE_URL selects PostgreSQL. The scripts use an owner/operator connection, not a public web role. DATA_DIR selects a different local store. Never seed a shared working database. PostgreSQL seeding requires --demo-database.

The fictional demo has two journeys: account onboarding and annual renewal. It includes an outdated interview finding, an unassigned action, overdue reviews and two measurements of dispatch clarity. Dates are relative to today. Seeding twice preserves existing records.

## The weekly rituals

Monday: /weekly-review joins journey health, attention, priorities, owner workload and measured outcomes. Before deciding what to improve: /evidence-gaps and /priorities. In the review: /decide records the operator's decision. After a change: /log-metric and /close-opportunity record observations and completion. /draft-review and /draft-brief prepare private documents.

27 CLI commands and 31 operational slash-command recipes. Every CLI command accepts --json. Mutations require --actor and support --dry-run. Exact codes, case-insensitive names and partial UUIDs resolve records. Ambiguous matches list candidates and exit 1. [Command recipes](.claude/commands/).

## Evidence follows the step it describes

Changing step content increments its revision and clears its journey review. Earlier evidence becomes stale. Extending an evidence review date does not update its original step revision. New evidence is required for a revised step. Approval needs current evidence; closure needs current evidence plus measurements on two dates for the same metric and unit. A closed action is not a claim that an improvement caused the result.

Impact and effort are owner-entered scores from one to five. Priority is impact divided by effort, shown beside the evidence count. It is not a forecast. Actor, before and after values, and decision notes remain in the audit history. Database administrators can alter records; this is not a tamper-proof audit service.

## Ten questions you can ask today

These are tested questions tailored to the owned system, not claims that UXPressia cannot answer them.

1. Which steps have no current evidence? Run `evidence-gaps`.
2. Which findings refer to an earlier step revision? Run `evidence`.
3. What needs a decision before the next review? Run `priorities`.
4. Which high-impact improvements have no current evidence? Run `opportunities`.
5. Who owns the overdue actions? Run `attention`.
6. Who has the largest unassigned or overdue workload? Run `owner-load`.
7. Did the recorded measure change after an improvement? Run `outcomes`.
8. Which personal findings need a retention review? Run `compliance`.
9. What did the record say before an operator changed it? Run `activity`.
10. Which journeys combine overdue actions with evidence gaps? Run `journeys`.

## Bring your history

```bash
npm run journeys -- import uxpressia --file=fixtures/uxpressia.csv --source=demo-import --journey=IMPORTED --actor="Your name" --dry-run
```

Use your export in place of the fixture and repeat without --dry-run when the counts agree. The importer supports the row layout in the vendor's downloadable CSV example and configurable column mapping. Every original column is retained. It does not reconstruct a visual canvas, images, comments or approval history. [Export, mapping and reconciliation](docs/replace-uxpressia.md).

## Documents and views

Edit brand.json once. npm run docs renders journey briefs and improvement decision records, with evidence and measurements. npm run view produces the weekly review, priority queue and ordered journey map. These are read-only HTML snapshots, printable to PDF. They contain no editing controls. [What a screen adds](docs/why-no-front-end.md).

/compliance flags missing purposes and overdue retention reviews for personal evidence, with NZ and AU source links. Review dates are business policy, not statutory retention periods. It neither deletes data nor certifies compliance. [Rules and applicability](docs/compliance.md).

## Your first hour: ten things to ask for

1. Put our name and logo on the journey brief.
2. Import one export without saving it.
3. Map our phase and pain-point columns.
4. Add our service owner to each journey.
5. Record the source behind a pain point.
6. Show which findings are out of date.
7. Add our impact scoring guidance.
8. Compare the same measure before and after a change.
9. Add a channel breakdown to Monday's view.
10. Prepare a review brief without sending it.

/customise writes a tested migration for a requested field or rule. /new-view adds a read-only report. All original export columns remain available for additional mappings.

## Verification and operation

npm test creates a temporary database, migrates and seeds twice, exercises all CLI commands, and verifies revision-sensitive evidence, decision gates, metric units, import rollback, idempotency, mapping, original columns, exports, ambiguity, real CLI output and escaped HTML. CI runs Node 20 and 22 on Windows and Linux, plus PostgreSQL 17. Check the actual CI results before treating a platform as passed.

Use a disposable empty database for TEST_DATABASE_URL. For shared production use, configure operator access, network controls, TLS, backups, recovery checks and retention procedures. Local files and exports stay private and ignored by Git. Export includes every business table and the full audit history; it is a portable snapshot, not an implemented restore command. Back up the database separately and test recovery.

## Price context

UXPressia Business lists US$95 per user per month. A 25-user monthly-billing scenario is US$28,500 a year before tax. This is a rate calculation, not a verified NZ/AU customer invoice. Annual billing and discounts can reduce it. [Vendor pricing](https://uxpressia.com/pricing), checked 1 November 2026. [Selection and limitations](docs/research.md).

## Built and run for you

Enterprise DNA maps the agreed UXPressia exports, checks the result and builds your fields, rules and documents. A shared web view, integrations or another stack can be part of your custom version. Omni by Enterprise DNA runs it for one setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=uxpressia).

MIT. Not affiliated with UXPressia or Anthropic. Hosting and agent usage have their own costs.
