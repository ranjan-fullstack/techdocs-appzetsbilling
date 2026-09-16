// Backup, retention, migration & pricing architecture for AppzetBilling — built from a
// read-only audit of the live Hostinger VPS API (account catalog, VM metrics, backup list)
// on 2026-09-15/16, cross-checked against this repo's own DB Architecture / Tech Stack /
// Known Issues audits (2026-09-13/14). Every figure is tagged 'verified' (read directly off
// the live server or account API), 'assumption' (a stated capacity-planning input), or
// 'review' (a legal/business decision AppzetBilling has to make, not a technical fact).

export const LIVE_METRICS = [
  { k: 'VPS plan', v: 'KVM 2', u: '2 vCPU · 8 GB RAM · 100 GB disk', tag: 'verified' },
  { k: 'CPU in use', v: '~1.4%', u: '7-day average, live VPS metrics', tag: 'verified' },
  { k: 'RAM in use', v: '2.2–2.9 GB', u: 'of 8 GB (~30%)', tag: 'verified' },
  { k: 'Disk in use', v: '~10.2 GB', u: 'of 100 GB (~10%)', tag: 'verified' },
];

export const ARCH_FACTS = [
  { k: 'Runtime', v: 'PHP 8.4.22 · Laravel 10.10 · nwidart/laravel-modules 10.0.6 (7 addon packages)' },
  { k: 'Database', v: 'Percona MySQL 8.4.10-10, InnoDB, utf8mb4_unicode_ci' },
  { k: 'Web / proxy', v: 'nginx 1.30.3 → nginx :8080 → php-fpm :17001 (pm=ondemand, max_children=250)' },
  { k: 'Hosting', v: 'Hostinger VPS, Ubuntu 24.04.4 LTS, CloudPanel control panel (clpctl)' },
  { k: 'Queue / scheduler', v: 'Queue driver = database, but no worker process runs; no cron calls schedule:run anywhere on the server' },
  { k: 'Backups (existing)', v: 'CloudPanel: daily gzipped mysqldump (03:15, clpctl db:backup), 7-day local retention. Hostinger: weekly whole-VM snapshot via Proxmox Backup Server. Offsite copy to Cloudflare R2 added 2026-09-17 — see §16' },
  { k: 'Source control', v: 'github.com/ranjan-fullstack/appzetbilling, single branch, no CI/CD' },
];

export const DB_STATS = [
  { k: 'Businesses (tenants)', v: '38' },
  { k: 'Users', v: '54' },
  { k: 'Products', v: '327' },
  { k: 'Sales recorded', v: '76' },
  { k: 'Largest table (disk)', v: 'notifications', u: '862 rows / ~272 KB' },
  { k: 'Migrations applied', v: '97' },
];

export const RISKS = [
  { sev: 'crit', t: 'No copy of any backup leaves the VPS', d: 'The daily mysqldump lives on the same disk as the database it backs up. The weekly Hostinger snapshot is off-VM but still the same provider and, per the account API, the same data-center region as production. One incident that takes out the account, the region, or the disk takes every backup with it.' },
  { sev: 'crit', t: 'No way to restore one tenant without restoring all 38', d: "Because every tenant shares one database, the only restore unit today is the entire database. Recovering one restaurant's accidentally-deleted data means restoring everyone else's data back to that point too, unless the manual scratch-database procedure in §11 is followed by hand." },
  { sev: 'warn', t: "Backups aren't encrypted beyond what gzip provides", d: 'gzip compresses; it does not encrypt. A stolen or leaked backup file is fully readable, including whatever customer PII and payment metadata rows contain.' },
  { sev: 'warn', t: 'No evidence of restore testing', d: 'Backup files exist and are dated correctly (verified), but nothing in the audit found a documented or scheduled restore drill. An unverified backup is a belief, not a guarantee.' },
  { sev: 'warn', t: 'Retention is short and single-tier', d: "7 days, one location, one frequency (daily). There's no month-end or long-term archive tier — a deletion discovered on day 9 is already unrecoverable from backup." },
  { sev: 'info', t: "The scheduler that would run automated backup-health checks doesn't run", d: 'schedule:run has no cron entry (Known Issues, Finding 21). Any backup-verification job built as a Laravel scheduled command will silently never execute unless this is fixed first.' },
];

export const OPTIONS_TABLE = {
  cols: ['A — Hostinger local only', 'B — Cloud object storage', 'C — Dedicated backup VPS', 'D — Hybrid (recommended)'],
  rows: [
    { label: 'What it is', vals: ['daily dump + weekly VM snapshot, nothing leaves Hostinger', 'push encrypted backups to S3/R2/B2, production stays put', 'a second always-on VPS whose only job is holding backups', 'short local retention + encrypted offsite object storage + the existing VM snapshot as a third layer'] },
    { label: 'Storage cost', vals: ['₹0 extra (bundled with hosting)', 'very low — cents to a few hundred ₹/month at current scale, §12', 'a full second VPS bill (₹1,399+/mo) to store what object storage handles for less', 'local: ₹0 extra. Offsite: same as B'] },
    { label: 'Restore speed', vals: ['fastest — same disk / same rack', 'slightly slower — download over network first', 'comparable to B, plus SSH/network overhead', 'fast local path (7 days) + offsite fallback — best of both'] },
    { label: 'Disaster recovery', vals: ['none — backup dies with the server', 'real DR — independent provider / region option', 'partial — still Hostinger-adjacent unless a different provider', 'real DR, plus the VM snapshot covers "restore the whole box," not just the database'] },
    { label: 'Maintenance', vals: ['zero — already running', 'one script (upload + lifecycle policy), low upkeep', 'a whole second server to patch, secure and pay for', 'same low upkeep as B, plus keeping the working local/VM layers as-is'] },
    { label: 'Verdict', vals: ['not sufficient alone', 'necessary piece', 'not economical yet', 'recommended'], sevs: ['crit', 'ok', 'warn', 'ok'] },
  ],
};

export const STORAGE_PRICING = [
  { provider: 'Cloudflare R2', storage: '$0.015', egress: 'Free — unconditionally', writes: '$4.50 / million', reads: '$0.36 / million', s3: 'Yes', free: '10 GB + 1M writes + 10M reads/mo', highlight: true },
  { provider: 'Backblaze B2', storage: '$0.00695', egress: 'Free up to 3× stored volume, then $0.01/GB', writes: 'Free (Class A/B/C)', reads: 'Free (Class A/B/C)', s3: 'Yes (S3-compatible endpoint)', free: '10 GB storage' },
  { provider: 'Amazon S3 Standard', storage: '$0.023', egress: '$0.09/GB after 100GB/mo free', writes: '$0.005 / 1,000', reads: '$0.0004 / 1,000', s3: 'Native', free: 'None ongoing' },
  { provider: 'S3 Glacier Deep Archive', storage: '$0.004', egress: 'Retrieval fee + 180-day min. duration', writes: '—', reads: '—', s3: 'Native', free: '—' },
];

export const TENANCY_QA = [
  { q: 'Should every restaurant have its own database?', a: "No. At 38–5,000 tenants, one database with row-level isolation is simpler to back up, migrate and query across (reporting, billing, support) than provisioning and patching thousands of schemas. Worth reconsidering only past the point a single MySQL instance can't hold the working set — see §12, not before." },
  { q: 'Should all restaurants share one MySQL database?', a: "Yes — this is already the architecture, and it's the right one for this stage. Verified in §02." },
  { q: 'Should every restaurant have its own backup?', a: 'Not a separate backup job — one daily job for the whole database remains correct. But the backup file format should support extracting one tenant\'s rows without restoring everything (§10\'s backup_files.business_id design).' },
  { q: 'Full-database or tenant-specific backups?', a: 'Both, on different cadences: a full daily logical dump (cheap, already running) plus a periodic per-tenant logical export — needed for single-tenant restore, offboarding exports, and migration-out requests alike.' },
  { q: 'How do we restore only one restaurant?', a: "Today: manually, via a scratch-database procedure — see §11. After the per-tenant export capability ships: restore that tenant's own file directly, no scratch database needed." },
  { q: 'How do we restore the entire platform?', a: 'Restore the most recent full daily dump into a fresh MySQL instance — or, for a total server loss, restore the weekly Hostinger VM snapshot first, then layer the latest daily DB backup on top to close the gap since the snapshot was taken.' },
  { q: "How do we prevent one restaurant accessing another's data?", a: 'Row-level scoping via business_id on every query, already the app\'s convention. The two global-uniqueness bugs in §02 are the schema\'s only known cracks in this guarantee and should close before scaling tenant count further.' },
  { q: 'How do we handle a restaurant leaving?', a: "Give them a self-service export (§10's GET /data-export) covering every table scoped to their business_id, then soft-flag the tenant inactive rather than deleting — keep rows through the normal retention window, then hard-delete on schedule per §07." },
  { q: 'How do we support migrating to another DB provider later?', a: 'Because this is standard MySQL (Percona, InnoDB, no exotic extensions found in the audit), moving to any managed MySQL-compatible service later is a mysqldump/logical-replication exercise, not a rewrite — provided the schema stays clean of tenant-isolation shortcuts like the ones flagged in §02.' },
];

export const RETENTION_TABLE = [
  { window: '1 year', cost: 'Lowest', perf: 'None at this data volume', fits: 'A single-location QSR wanting this-year-vs-last-year comparison only' },
  { window: '2–3 years', cost: 'Low — data is tiny, §02', perf: 'None at this data volume', fits: 'Most independent restaurants; a typical accounting/audit cycle' },
  { window: '5 years', cost: 'Still low relative to VPS cost, §12', perf: 'None expected before tens of thousands of tenants', fits: 'Multi-outlet operators, franchise accounting' },
  { window: 'Unlimited', cost: 'Grows with tenancy but stays a small fraction of infra cost, §12', perf: 'Worth monitoring past ~1,000 active tenants', fits: 'Enterprise tier, or any restaurant with a legal reason to never delete' },
];

export const PRICING_PLANS = [
  {
    name: 'Basic', price: '₹799', per: '/mo',
    features: [
      '1 year in-app historical data',
      'Standard backup protection included (7-day local + 90-day offsite) — same safety net as every plan',
      'CSV export, self-service',
      '1 free restore request/year; ₹499 per additional restore',
      'Extra history: ₹99/mo per additional year',
    ],
  },
  {
    name: 'Professional', price: '₹1,999', per: '/mo', featured: true,
    features: [
      '3 years in-app historical data',
      'Standard backup protection, plus 12-month offsite monthly archive',
      'CSV, Excel & PDF export',
      '2 free restore requests/year, priority turnaround',
      'Extra history: ₹79/mo per additional year',
    ],
  },
  {
    name: 'Enterprise', price: 'From ₹4,999', per: '/mo',
    features: [
      '5+ years, or unlimited on request, in-app historical data',
      'Unlimited offsite backup retention (fair-use)',
      'Unlimited free restores; dedicated restore SLA',
      'Optional dedicated VPS, priced at infrastructure cost + margin — real pricing in §12',
      'Assisted migration-in for new locations included',
    ],
  },
];

export const MIGRATION_ENTITIES = [
  { src: 'Products / items', maps: 'products, categories', rel: "Every invoice line item's product reference must resolve after import, even if the source used a different product ID scheme" },
  { src: 'Customers / suppliers', maps: 'parties', rel: 'One unified table today (§02) — dedupe by phone/email within the tenant, not globally (the existing global-unique bug must be fixed first)' },
  { src: 'Sales invoices', maps: 'sales, sale_details', rel: 'Original invoice date must be preserved (not import date) — this is a financial record, not a fresh transaction' },
  { src: 'Purchases', maps: 'purchases, purchase_details', rel: 'Line items must reference the correct imported ingredient/product, not a placeholder' },
  { src: 'Inventory opening balances', maps: 'ingredients.stock_quantity + a dated stock_movements row', rel: 'Must land as a dated opening-balance ledger entry, not silently overwrite stock_quantity with no audit trail' },
  { src: 'Payments / expenses', maps: 'transactions, expenses', rel: 'Must reference the correct migrated sale/purchase, not go in as unlinked entries' },
];

export const MIGRATION_STEPS = [
  { t: 'Upload', d: 'Restaurant admin uploads a file — CSV, XLSX, JSON, a SQL dump, or a MySQL connection string. Stored via migration_files (§10), never parsed inline on the request thread.' },
  { t: 'Detect & validate', d: 'A queued worker sniffs file type and schema shape — this is why a queue worker is a hard prerequisite (§01/§13). Parsing a large export synchronously on a web request will time out or block php-fpm workers.' },
  { t: 'Map fields', d: 'AI-assisted column mapping, human-confirmed. Suggest source-column → AppzetBilling-field mappings with a confidence score, but require explicit confirmation before anything is staged — never auto-import on a guess.' },
  { t: 'Preview & validate', d: 'Show the admin what will happen before it happens: row counts, sample transformed rows, and every validation error (missing field, unresolvable reference, currency mismatch) — sourced from staging, nothing production yet.' },
  { t: 'Stage', d: 'Import into staging tables, not production. Duplicate detection runs here against existing production rows — the admin decides skip/merge/import-anyway per conflict class, not per row.' },
  { t: 'Confirm & commit', d: 'Only valid, confirmed rows move to production, in FK-dependency order (parties → products → purchases/sales → line items → payments), inside transactions.' },
  { t: 'Report & rollback window', d: "Every row this migration created is tagged with its migration_job_id; a rollback within the window deletes exactly those rows and nothing the tenant created independently since." },
];

// A real Petpooja customer asked to move their data in while this document was being built —
// the trigger for formalizing the workflow above into a concrete, phased tool below, rather than
// leaving it as an architecture description with no build order.
export const TRANSFORMER_PHASES = [
  { phase: 'Phase 1 — MVP', scope: 'One entity at a time, starting with Products', build: "Upload a .csv/.xlsx → confirm entity type manually → plain fuzzy-match column suggestions (no AI needed yet) → validation report (required fields, type checks, duplicates against the existing table) → download a cleaned file already shaped to AppzetBilling's table structure." },
  { phase: 'Phase 2 — Reusable across sources', scope: 'Multi-sheet files, any POS system, not just Petpooja', build: 'Auto-split a multi-sheet file by detected entity (header-keyword matching first, AI classification for ambiguous cases). Save each confirmed mapping as a template per source_system_label — the next Petpooja migration maps itself instead of repeating the manual step.' },
  { phase: 'Phase 3 — Full wizard', scope: 'Removes the download/re-upload step entirely', build: 'Commit straight into migration_staging_rows with a review screen, then a transactional, FK-ordered commit + rollback window — this is where the tool becomes the full 7-step workflow above instead of a standalone transformer.' },
];

export const SCHEMA_TABLES = [
  {
    name: 'migration_jobs', pk: 'id', fks: 'business_id → businesses.id (cascade) · initiated_by → users.id (set null)', idx: '(business_id), (status)',
    purpose: 'One row per import attempt.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['business_id', 'bigint unsigned', '', 'no', 'Tenant this import belongs to'],
      ['source_type', 'enum', '', 'no', 'csv / excel / json / mysql_dump / mysql_live / other'],
      ['source_system_label', 'varchar(120)', '', 'yes', 'Free text, e.g. "Petpooja export"'],
      ['status', 'enum', '', 'no', 'uploaded / mapping / staged / validated / importing / completed / failed / rolled_back'],
      ['initiated_by', 'bigint unsigned', '', 'yes', 'Admin user who started it'],
      ['total_rows / imported_rows / error_rows', 'int', '', 'no', 'Progress & report counters'],
      ['started_at / completed_at', 'timestamp', '', 'yes', 'Job timing'],
    ],
  },
  {
    name: 'migration_files', pk: 'id', fks: 'migration_job_id → migration_jobs.id (cascade)', idx: '(migration_job_id)',
    purpose: 'The raw uploaded artifact, kept for re-processing and audit even after staging completes.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['migration_job_id', 'bigint unsigned', '', 'no', 'Owning migration job'],
      ['original_filename', 'varchar(255)', '', 'no', 'As uploaded'],
      ['storage_path', 'varchar(500)', '', 'no', 'Where the file actually lives'],
      ['mime_type', 'varchar(120)', '', 'no', 'Detected content type'],
      ['size_bytes', 'bigint unsigned', '', 'no', 'File size'],
      ['checksum_sha256', 'char(64)', '', 'no', 'Integrity check'],
    ],
  },
  {
    name: 'migration_field_mappings', pk: 'id', fks: 'migration_job_id (cascade)', idx: '(migration_job_id, entity)',
    purpose: "Makes the field-mapping step data, not code — mappings can be suggested, previewed and edited before anything imports.",
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['entity', 'varchar', '', 'no', 'product / category / party / purchase / sale_invoice / payment / expense / inventory / user'],
      ['source_field', 'varchar(120)', '', 'no', 'Column name in the uploaded file'],
      ['target_field', 'varchar(120)', '', 'no', 'AppzetBilling column it maps to'],
      ['transform_rule', 'json', '', 'yes', 'Date formats, lookup tables, defaults'],
      ['is_required', 'bool', '', 'no', 'Import blocks without it'],
      ['confidence_score', 'decimal(5,2)', '', 'yes', 'AI suggestion confidence, before human confirms'],
      ['confirmed_at', 'timestamp', '', 'yes', 'When a human approved this mapping'],
    ],
  },
  {
    name: 'migration_staging_rows', pk: 'id', fks: 'migration_job_id (cascade)', idx: '(migration_job_id, entity, status)',
    purpose: 'One generic staging table across all entity types rather than ten per-entity tables — a temporary landing zone, not permanent schema.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['entity', 'varchar', '', 'no', 'Which target table this row will become'],
      ['source_row_number', 'int', '', 'no', 'Line number in the original file, for error reporting'],
      ['raw_payload', 'json', '', 'no', 'The row exactly as parsed, before mapping'],
      ['mapped_payload', 'json', '', 'no', 'After field mapping — what would actually be inserted'],
      ['status', 'enum', '', 'no', 'pending / valid / invalid / imported / skipped_duplicate'],
      ['validation_errors', 'json', '', 'yes', 'Per-row error detail for the preview step'],
      ['matched_existing_id', 'bigint unsigned', '', 'yes', 'Set when duplicate detection matches a live production row'],
    ],
  },
  {
    name: 'migration_errors', pk: 'id', fks: 'migration_job_id (cascade) · staging_row_id → migration_staging_rows.id (set null)', idx: '(migration_job_id)',
    purpose: 'A queryable error log separate from row-level validation_errors JSON, for the migration report and support triage across many jobs.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['entity', 'varchar', '', 'no', 'Which entity type this error concerns'],
      ['severity', 'enum', '', 'no', 'warning / error / critical'],
      ['error_code', 'varchar(60)', '', 'no', 'Machine-readable error identifier'],
      ['message', 'text', '', 'no', 'Human-readable detail'],
      ['field', 'varchar(120)', '', 'yes', 'The offending field, if applicable'],
    ],
  },
  {
    name: 'backup_jobs', pk: 'id', fks: 'triggered_by → users.id (set null; null = system/cron)', idx: '(status, started_at), (retention_expires_at)',
    purpose: "The metadata record for every backup run — what §04's monitoring and §11's retention-purge job both query.",
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['type', 'enum', '', 'no', 'scheduled_full / scheduled_incremental / manual / pre_migration_snapshot'],
      ['status', 'enum', '', 'no', 'running / completed / failed'],
      ['storage_provider', 'enum', '', 'no', 'local / cloudflare_r2 / aws_s3 / backblaze_b2'],
      ['started_at / completed_at', 'timestamp', '', 'yes', 'Run timing'],
      ['size_bytes_compressed', 'bigint unsigned', '', 'no', 'Compressed backup size'],
      ['checksum_sha256', 'char(64)', '', 'no', 'Integrity check'],
      ['retention_expires_at', 'timestamp', '', 'no', 'When the purge job may delete this'],
    ],
  },
  {
    name: 'backup_files', pk: 'id', fks: 'backup_job_id (cascade) · business_id → businesses.id (set null)', idx: '(backup_job_id), (business_id)',
    purpose: 'Null business_id = whole-database file. Set = a single tenant\'s isolated logical export — the table that turns "restore one restaurant" into a direct file restore.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['backup_job_id', 'bigint unsigned', '', 'no', 'Owning backup run'],
      ['business_id', 'bigint unsigned', '', 'yes', 'null = whole-DB file, set = single-tenant export'],
      ['object_key', 'varchar(500)', '', 'no', 'Path/key in the storage provider'],
      ['size_bytes', 'bigint unsigned', '', 'no', 'File size'],
      ['part_number', 'int', '', 'no', 'For multi-part dumps'],
    ],
  },
  {
    name: 'restore_jobs', pk: 'id', fks: 'backup_file_id → backup_files.id (restrict) · business_id (null = full-platform) · requested_by / approved_by → users.id (set null)', idx: '(business_id, status)',
    purpose: 'An approval gate and audit trail for every restore — required given how destructive an unreviewed restore into production could be.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['backup_file_id', 'bigint unsigned', '', 'no', 'Which backup this restores from'],
      ['business_id', 'bigint unsigned', '', 'yes', 'null = full-platform restore'],
      ['reason', 'text', '', 'no', 'Why the restore was requested'],
      ['target', 'enum', '', 'no', 'production / staging_sandbox'],
      ['status', 'enum', '', 'no', 'requested / approved / running / completed / failed / cancelled'],
      ['started_at / completed_at', 'timestamp', '', 'yes', 'Run timing'],
    ],
  },
  {
    name: 'tenant_retention_settings', pk: 'id', fks: 'business_id → businesses.id (cascade, unique)', idx: 'unique (business_id)',
    purpose: 'The per-tenant record behind §07/§08 — what this tenant\'s plan promises, independent of the plan\'s own future changes.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['business_id', 'bigint unsigned', '', 'no', 'One row per tenant'],
      ['included_history_years', 'tinyint', '', 'no', 'In-app historical data window'],
      ['included_backup_retention_days', 'smallint', '', 'no', 'Backup safety-net window'],
      ['extra_history_years_purchased', 'tinyint', '', 'no', 'Default 0'],
      ['extra_backup_retention_days_purchased', 'smallint', '', 'no', 'Default 0'],
      ['export_format_allowed', 'json', '', 'no', 'e.g. ["csv","xlsx","pdf"]'],
    ],
  },
  {
    name: 'storage_usage', pk: 'id', fks: 'business_id → businesses.id (cascade)', idx: 'unique (business_id, measured_at)',
    purpose: 'One snapshot per tenant per day — feeds the storage-usage API and the §12 cost model with real, not modeled, numbers once running.',
    cols: [
      ['id', 'bigint unsigned', 'PK', '', 'Primary key'],
      ['business_id', 'bigint unsigned', '', 'no', 'Which tenant'],
      ['measured_at', 'date', '', 'no', 'Snapshot date'],
      ['primary_db_bytes', 'bigint unsigned', '', 'no', "Tenant's share of primary DB"],
      ['backup_bytes_local', 'bigint unsigned', '', 'no', 'Local backup footprint'],
      ['backup_bytes_cloud', 'bigint unsigned', '', 'no', 'Offsite backup footprint'],
      ['uploaded_file_bytes', 'bigint unsigned', '', 'no', 'Receipts/product images under public/uploads'],
    ],
  },
];

export const API_ENDPOINTS = [
  { m: 'POST', p: '/api/business/migrations', d: 'Start a migration job (source type + label)' },
  { m: 'POST', p: '/api/business/migrations/{id}/files', d: 'Upload a migration file' },
  { m: 'GET', p: '/api/business/migrations/{id}/preview', d: 'Parsed sample rows + AI-suggested field mappings' },
  { m: 'POST', p: '/api/business/migrations/{id}/mappings', d: 'Confirm or edit field mappings' },
  { m: 'POST', p: '/api/business/migrations/{id}/validate', d: 'Run staging validation, return the error summary' },
  { m: 'POST', p: '/api/business/migrations/{id}/confirm', d: 'Commit valid staged rows to production (queued)' },
  { m: 'GET', p: '/api/business/migrations/{id}/status', d: 'Poll progress' },
  { m: 'POST', p: '/api/business/migrations/{id}/rollback', d: 'Undo, within the rollback window' },
  { m: 'GET', p: '/api/business/data-export', d: "Request a full export of the tenant's own data" },
  { m: 'POST', p: '/api/business/restore-requests', d: 'Request a restore (creates a restore_jobs row pending approval)' },
  { m: 'GET', p: '/api/business/restore-requests/{id}', d: 'Check restore status' },
  { m: 'GET', p: '/api/business/storage-usage', d: 'Current usage vs. plan-included allowance' },
];

export const DR_TARGETS = [
  { k: 'Current RPO', v: '24 hrs', u: 'daily dump is the tightest existing recovery point' },
  { k: 'Current RTO (whole VM)', v: '~30 min', u: '1,800s, verified live via the Hostinger backup API' },
  { k: 'Target RPO (post-hybrid)', v: '≤ 1 hr', u: 'once incremental/binlog backup is added — cheap at current volume, §12' },
  { k: 'Target RTO (single tenant)', v: '≤ 30 min', u: 'once per-tenant logical export exists — §10' },
];

export const DR_SCENARIOS = [
  { s: 'Accidental deletion', p: 'Restore from the most recent daily backup. Only branches and notifications use soft-deletes (verified) — almost every other accidental delete has no app-level undo, so backup restore is the only recovery path for the other ~60 tables.' },
  { s: 'Database corruption', p: 'Restore the latest verified-good daily backup into a fresh instance; replay any available binlogs since, once incremental backup is added.' },
  { s: 'Hostinger server failure', p: 'Restore the weekly whole-VM snapshot (measured RTO ~30 min) to a new VM, then layer the latest offsite daily DB backup on top to close the gap since the snapshot.' },
  { s: 'Ransomware / unauthorized access', p: 'Offsite copies must be immutable/versioned (R2/S3 Object Lock or equivalent) — an attacker with production access must not also delete or encrypt the offsite backup history. Not yet in place; see §15.' },
  { s: 'Bad application deploy', p: 'No CI/CD or containerization exists today (§01) — a bad deploy is currently a manual git revert on the server. Related gap, flagged in §14, out of scope for this backup audit.' },
  { s: 'Complete database loss', p: 'Full restore procedure above; expected data loss window = time since last successful offsite backup (target ≤ 1 hr post-hybrid, 24 hrs today).' },
];

export const DR_PROCEDURE = [
  { t: 'Restore to a scratch instance', d: 'Restore the relevant backup into an isolated scratch MySQL instance — never onto production.' },
  { t: 'Export the one tenant', d: "Export only WHERE business_id = X across the ~50 tenant-scoped tables, in foreign-key order." },
  { t: 'Diff against production', d: 'Compare against current production rows for that tenant to avoid clobbering anything created after the incident.' },
  { t: 'Upsert into production', d: 'Import the recovered rows inside a transaction, using explicit upsert logic per table.' },
  { t: 'Verify & close out', d: "Spot-check row counts with the tenant before closing the incident. Building §10's backup_files.business_id export turns steps 1–3 into a direct file restore." },
];

export const COST_INPUTS = [
  { i: 'Primary data per mature restaurant', v: '80 MB', b: 'assumption — a year of sales/purchase/inventory history at moderate transaction volume' },
  { i: 'Daily growth per active restaurant', v: '~150 KB/day', b: 'assumption — ≈4.5 MB/month from ongoing sale/stock-movement rows' },
  { i: 'Backup compression (gzip)', v: '5×', b: 'assumption — typical for text-heavy InnoDB logical dumps' },
  { i: 'Cloud copies retained (steady state)', v: '23', b: 'assumption — 7 daily + 4 weekly + 12 monthly (GFS rotation)' },
  { i: 'USD → INR', v: '₹88', b: 'review — approximate; re-check FX at purchase time' },
  { i: 'KVM 2 / 4 / 8 VPS cost', v: '₹1,399 / ₹2,599 / ₹4,699 per mo', b: 'verified — real Hostinger catalog, annual plan amortized monthly' },
];

export const COST_SIM = [
  { r: '10', db: '0.8 GB', backup: '0.16 GB', offsite: '3.7 GB', r2: '₹0 (free tier)', vps: 'KVM 2', infra: '₹1,399', per: '₹140' },
  { r: '100', db: '8 GB', backup: '1.6 GB', offsite: '37 GB', r2: '₹49', vps: 'KVM 2', infra: '₹1,448', per: '₹14.5' },
  { r: '500', db: '40 GB', backup: '8 GB', offsite: '184 GB', r2: '₹243', vps: 'KVM 4 (DB) + KVM 2 (app)', infra: '₹4,241', per: '₹8.5' },
  { r: '1,000', db: '80 GB', backup: '16 GB', offsite: '368 GB', r2: '₹486', vps: 'KVM 8 (DB) + KVM 4 (app)', infra: '₹7,784', per: '₹7.8' },
  { r: '5,000', db: '400 GB', backup: '80 GB', offsite: '1,840 GB', r2: '₹2,429', vps: '2× KVM 8 + 2× KVM 4 (re-architecture needed)', infra: '₹17,025', per: '₹3.4' },
];

export const BACKUP_ROADMAP = [
  { pri: 'now', t: 'Add the missing schedule:run cron entry', d: 'Already on the engineering roadmap independent of this audit — but every automated backup-verification and retention-purge job depends on it. One line, zero application risk.' },
  { pri: 'now', t: 'Stand up the offsite copy', d: "Push the existing daily mysqldump to Cloudflare R2 (§05) immediately after it's produced — this alone closes the single biggest risk in §03.", done: true },
  { pri: 'now', t: 'Fix the two tenant-isolation bugs', d: 'coupons.code and parties.phone (§02) — required before building any per-tenant export/import tooling that assumes clean isolation.' },
  { pri: 'soon', t: 'Enable object versioning / immutability on the offsite bucket', d: 'Closes the ransomware gap in §11 — a configuration step on the R2 bucket, not new code.' },
  { pri: 'soon', t: 'Stand up a queue worker', d: 'Already flagged as a standalone gap — but also a hard prerequisite for the migration architecture in §09, which cannot run large imports synchronously.' },
  { pri: 'soon', t: 'Build backup_jobs / backup_files / storage_usage and wire up the storage-usage API', d: "Turns §12's modeled numbers into real measured ones, and is the metadata layer every later feature reads from." },
  { pri: 'later', t: 'Per-tenant logical export capability', d: 'Makes §06 Q5 ("restore one restaurant") and Q8 (offboarding export) direct operations instead of manual procedures.' },
  { pri: 'later', t: 'Migration wizard: upload → mapping → staging → import', d: 'Build the full pipeline in §09/§10, including AI-assisted mapping, after the queue worker above exists.' },
  { pri: 'later', t: 'Import transformer, Phase 1 (Products)', d: 'Triggered by a real Petpooja customer migration request — column-mapping + validation + clean-file-output tool, one entity at a time. See §09 for the phased build plan; does not require the queue worker or staging tables to start.' },
  { pri: 'later', t: 'First restore drill, then a recurring one', d: 'Prove the backup actually restores before promising customers it does. Repeat on a schedule once the scheduler is fixed.' },
  { pri: 'later', t: 'Split database onto its own VPS', d: 'Triggered by the CPU/RAM trend crossing a comfortable threshold, not by tenant count alone — instrument and watch, per §12.' },
];

export const SECURITY_RISKS = [
  { sev: 'crit', t: 'Backups are unencrypted and single-location', d: 'gzip is compression, not encryption; every copy today is on the same VPS. See §03/§04 — the highest-severity item in this audit.' },
  { sev: 'warn', t: 'SSH allows root login with password authentication', d: 'Verified in /etc/ssh/sshd_config: PermitRootLogin yes and PasswordAuthentication yes together. fail2ban is active, but a guessed root password remains a valid path in.' },
  { sev: 'warn', t: 'CORS allowed_origins is a wildcard', d: "config/cors.php has ['*'] on every API route — relevant here because migration/export endpoints (§10) are exactly the kind of surface a wildcard CORS policy shouldn't apply to." },
  { sev: 'warn', t: 'New file-upload surface needs its own hardening', d: 'The migration wizard (§09) introduces a new class of upload (CSV/XLSX/SQL dumps) — needs explicit file-type/size limits, CSV-formula-injection sanitization and sandboxed parsing.' },
  { sev: 'info', t: 'Two tenant-isolation constraint bugs', d: 'coupons.code and parties.phone — detailed in §02, the schema\'s only confirmed cracks in cross-tenant isolation.' },
  { sev: 'info', t: 'Application log runs at debug level and never rotates', d: 'storage/logs/laravel.log, LOG_LEVEL=debug, growing forever — worth checking this file never ends up inside backup/export payloads once migration tooling bundles data for support.' },
];

export const OPEN_QUESTIONS = [
  { t: "What's the real near-term scale target?", d: 'Live tenant count is 38. The infrastructure sizing in §12 changes meaningfully depending on whether "thousands of restaurants" is a 2-year plan or a 5-year one.' },
  { t: 'Who owns and pays for the cloud storage account?', d: 'Cloudflare R2 (§05) needs an account, billing owner, and access-key rotation policy before the first backup ships offsite.' },
  { t: 'Approval to fix the two tenant-isolation bugs', d: 'coupons.code / parties.phone (§02) — a schema migration on production, needs a maintenance-window sign-off.' },
  { t: 'Legal/accounting confirmation of retention minimums', d: 'Per §07 — required before the default retention policy and any plan-tier deletion promise is published to customers.' },
  { t: 'Approval for the schedule:run cron fix', d: 'Zero-risk, one line, but it is a production server config change.' },
  { t: 'Security review before opening customer file uploads', d: 'The migration wizard (§09) is new attack surface (§14) — worth a dedicated review pass before customer-facing.' },
  { t: 'Budget sign-off for the phased VPS path', d: 'KVM 2 → split DB onto KVM 4/8 as usage crosses the thresholds in §12 — real pricing, no purchase made.' },
  { t: 'Restore SLA commitments', d: "§08's pricing tiers reference restore turnaround by plan — those numbers need an operational commitment before publishing." },
];

// Everything above this point is the original read-only audit (2026-09-15/16) — nothing on the
// server was touched while producing it. The arrays below document the one exception: the §13
// "now" item "stand up the offsite copy" was actually implemented and verified against the live
// production VPS on 2026-09-17.

export const IMPLEMENTATION_STATS = [
  { k: 'Offsite copy', v: 'Live', u: 'Cloudflare R2 · appzetsbilling-backup · since 2026-09-17' },
  { k: 'Push schedule', v: '03:20 daily', u: '5 min after the existing 03:15 local dump' },
  { k: 'Cost impact', v: '₹0', u: "current DB size stays inside R2's free tier — §12" },
  { k: 'Verification', v: 'End-to-end', u: "today's real dump pushed, then confirmed present in the bucket" },
];

export const IMPLEMENTATION_STEPS = [
  { t: 'Connect & re-verify the environment', d: 'SSHed into the production VPS (srv1772946 / 203.0.113.10) with the existing key and confirmed the actual backup mechanics, which differ slightly from the generic description in §01: clpctl db:backup runs at 03:15 via /etc/cron.d/clp, and dumps land at /home/appzetsbilling-app/backups/databases/appzetsbilling/YYYY-MM-DD/*.sql.gz.' },
  { t: 'Create the R2 bucket and a scoped access token', d: 'Created the appzetsbilling-backup bucket (Standard storage class, Automatic/Asia-Pacific location) and an Account API Token restricted to Object Read & Write on that one bucket only — not account-wide, per the least-privilege note in §15.' },
  { t: 'Configure and debug the S3 client', d: "rclone was already installed on the VPS but at an old version (1.60.1) with no R2 remote configured. Writes initially failed with 403 Access Denied despite correct credentials — traced to that old version issuing a CreateBucket preflight check the scoped token isn't permitted to make. Fixed by upgrading to rclone 1.75.1 (official .deb, not a piped install script) and setting no_check_bucket=true." },
  { t: 'Deploy the push script and cron job', d: "/usr/local/bin/push-backup-to-r2.sh finds each day's dump and copies it to r2:appzetsbilling-backup/YYYY-MM-DD/, logging outcome to syslog. Scheduled via a new /etc/cron.d/r2-backup-push at 03:20 — kept as a separate file from CloudPanel's own cron.d/clp so a panel update can't silently remove it." },
  { t: 'Verify, not just deploy', d: "Ran the script manually against the real 2026-09-16 dump, then confirmed independently — via rclone tree and rclone ls against the live bucket, not just a clean exit code — that the file actually landed in R2." },
];
