# Operator deployment

Local mode uses PGlite with DATA_DIR. Share a PostgreSQL database only through configured trusted operators. Migrations enable row-level security and revoke public access; no application-user policies are supplied. The schema owner can operate the CLI. Administrators can alter the audit log, so it is an operational history rather than tamper-proof evidence.

Set DATABASE_URL through your deployment environment. TLS certificate verification is enabled for remote connections. Test access, backups and restoration before relying on a shared store. Do not use seed on production. TEST_DATABASE_URL must be an empty disposable database and runs the same tests as local mode.

Generated HTML, drafts and JSON exports can contain private information. They are ignored by Git and written with restricted file permissions where the platform supports them. Windows permissions need a separate access review. Restrict the working folder and backup access. Do not publish the HTML to an open site.

Export is a complete JSON snapshot, including original import columns and audit history, written only to a new file. Restore is not implemented: use a tested database backup process for recovery. The CLI has no sends, payments, remote integrations or deletion command.
