# Replace UXPressia records

Checked 1 November 2026. [Vendor export instructions](https://help.uxpressia.com/en/articles/1422172-uxpressia-export). Open the map, choose Export and select CSV. CSV is on paid plans. Keep a PDF alongside it to compare the visual material.

## Supported format, checked against a real vendor download

The vendor help page's customer journey CSV link currently downloads a row file with User Stories, Deliverables, Impacts, personas and Business Goals. Despite the link label, the contents resemble an impact map. We do not assume this is every journey export format. [Vendor example](https://static.uxpressia.com/downloads/Examples/Coffee_store_coffee_store.csv). The repository fixture is original synthetic content with the same headers, not a copy of the vendor's example.

The importer creates one ordered step per row. User Stories becomes the step name and customer action. All original columns remain in source_data, including Deliverables, Impacts, personas and Business Goals. They are not silently turned into verified evidence or approved improvements. A reviewed mapping can promote selected columns later.

```bash
npm run journeys -- import uxpressia --file=imports/journey.csv --source=onboarding-export --journey=ONBOARD --actor="Your name" --dry-run
npm run journeys -- import uxpressia --file=imports/journey.csv --source=onboarding-export --journey=ONBOARD --actor="Your name"
```

Run npm run migrate before importing into a new database. The first import creates the journey if it does not exist; add --name and --owner to label it. Its missing review date appears in attention. No seed is needed. Repeat the same source key and journey when reimporting the same document.

## Other columns

The importer also recognises Name or Step, Customer action, Pain points or Pain, Channel, and ID or Step ID. For another row-oriented layout, use --map=imports/mapping.json:

```json
{"id":"Identifier","name":"Phase","action":"Action","pain":"Problem","channel":"Channel"}
```

Only include mappings for columns that exist. Unknown columns are retained. A matrix export with stages across columns needs a reviewed transpose into rows first; it is rejected if it has no supported name column. Do not promise an untouched import for such a file. Enterprise DNA handles this mapping in the customised version.

## Reconciliation

Compare source row count, imported step count and order. Inspect source_data through export. Blank names, duplicate identities, malformed CSV and missing mapped columns stop the entire import. A dry run writes nothing, including no audit trail. Identical reimports change nothing. Changed rows stop unless --update is supplied. Updates advance the step revision and invalidate earlier evidence.

IDs make stable identities. Without an ID, the exact story text is hashed. Editing that story then creates a new step; provide a stable ID mapping before ongoing synchronisation. Reordering existing rows does not reorder existing steps. Source keys are per journey, so keep them stable and distinct between exports. This is a migration tool, not background sync.

Visual formatting, photos, attached files, comments, live integrations, access controls, personas as independent objects, decisions and historical versions need separate review. Preserve the originals. Never cancel the old service before checking the agreed scope, counts and representative records with its owner.
