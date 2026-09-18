// Deployment & Source Management audit — built from a live, read-only-except-noted check of the
// production VPS (git state, CloudPanel/clpctl capabilities, CI config, test setup) on 2026-09-17,
// cross-checked against this site's own DB Architecture / Known Issues / Backup & Migration audits.
// Every figure is tagged 'verified' (read directly off the live server), 'assumption' (a stated
// planning input), or 'review' (a decision AppzetBilling has to make, not a technical fact).

export const LIVE_STATS = [
  { k: 'Commits authored from prod (last 5)', v: '3 of 5', tag: 'verified' },
  { k: 'Uncommitted files on production', v: '4', tag: 'verified' },
  { k: 'Staging environments', v: '0', tag: 'verified' },
  { k: 'CI pipelines configured', v: '0', tag: 'verified' },
];

export const CURRENT_STATE = [
  { k: 'Source control', v: 'github.com/your-org/your-repo, single branch (main), SSH remote' },
  { k: 'Where the code actually lives', v: '/home/SITE_USER/htdocs on the production VPS — this is also the git working copy' },
  { k: 'Deploy method', v: 'Manual: SSH in, git pull, whatever steps the operator remembers. No deploy script exists on the server.' },
  { k: 'Rollback method', v: 'Manual git revert, live, directly on production' },
  { k: 'Control panel', v: 'CloudPanel 2.5.4-3+clp-noble — confirmed no built-in git-deploy/webhook command in clpctl (only site:add:php/nodejs/python/static/reverse-proxy)' },
  { k: 'Staging', v: 'None — only one site user (SITE_USER) exists on the VPS at all' },
  { k: 'CI/CD', v: 'None — no .github/workflows in the repo, no composer.json "test" script' },
  { k: 'Automated tests', v: '2 test files exist under tests/, but nothing ever runs them' },
  { k: 'Queue worker / process manager', v: 'Not installed — no supervisord/supervisorctl on the VPS (same gap flagged in the Backup & Migration audit)' },
  { k: '.gitignore hygiene', v: 'Correct — vendor/, node_modules/, .env, build artifacts all properly excluded' },
];

export const RISKS = [
  { sev: 'crit', t: 'Production has been edited and committed to directly, on the server', d: '3 of the last 5 commits are authored as root@ubuntu-cloudpanel.localhost — meaning the real workflow has been: SSH into production, edit code live, commit and push from there. This is the reverse of how source control should work; the server should only ever pull, never author history.' },
  { sev: 'crit', t: 'Right now, production has uncommitted local changes', d: 'A modified resources/views/layouts/web/master.blade.php plus untracked stray files (.env.bak-20260913090444, public/assets.zip, uploaded QR codes) are sitting in the working tree, unreconciled with git.' },
  { sev: 'crit', t: 'No staging environment exists', d: 'Every change — schema migration, dependency bump, feature — is tested for the first time in production, on live tenant data.' },
  { sev: 'warn', t: 'No CI — existing tests never run', d: 'tests/ has 2 test files already written. Nothing executes them automatically on a PR or a push; they could be silently broken for months with zero signal.' },
  { sev: 'warn', t: 'No atomic rollback', d: 'A bad deploy today is undone with a live git revert on production, not an instant symlink swap to the last known-good release — the app is broken for the duration of the fix.' },
  { sev: 'warn', t: 'Root SSH key used for everything, including deploys', d: 'There is no scoped deploy-only credential — the same root key that can do anything on the box would also be what a CI pipeline uses to push code, if automated as-is. Related to the existing finding that SSH permits root login with password auth (Backup & Migration §14).' },
  { sev: 'info', t: 'No composer "test" script wired up', d: "composer.json has no test entry — even running the 2 existing tests locally isn't a documented one-liner today." },
];

export const OPTIONS_TABLE = {
  cols: ['A — Status quo', 'B — CI only, manual deploy', 'C — Full CI/CD, atomic releases', 'D — Containers / multi-server'],
  rows: [
    { label: 'What it is', vals: ['SSH in, edit/pull, hope for the best', 'GitHub Actions runs tests on every PR; deploy still manual', 'CI gates every merge; merge to main auto-deploys via a releases+symlink pipeline with instant rollback', 'Dockerized app, orchestrated across multiple servers/regions'] },
    { label: 'Setup cost', vals: ['₹0 — already the state today', 'Low — a few hours, free GitHub Actions minutes at this scale', 'Moderate — a deploy script + a scoped SSH key + CI workflow, one-time build', 'High — new deploy model, new ops skillset, real infra cost'] },
    { label: 'Catches a bad change before prod', vals: ['No', 'Yes, if someone remembers to wait for CI before deploying', 'Yes, structurally — merge is blocked until CI passes', 'Yes, plus staged rollout across nodes'] },
    { label: 'Rollback speed', vals: ['Manual, live, on production', 'Same as A — deploy step is unchanged', 'Instant — symlink repoint to the last release', 'Instant, plus can roll back per-node'] },
    { label: 'Matches current scale (38 tenants, 1 VPS, 1.4% CPU)', vals: ['Yes, but unsafe', 'Yes', 'Yes', 'No — solving a scaling problem that does not exist yet'] },
    { label: 'Verdict', vals: ['not sufficient', 'a floor, not a destination', 'recommended', 'premature'], sevs: ['crit', 'warn', 'ok', 'warn'] },
  ],
};

export const CLOUDPANEL_FACTS = [
  { k: 'Version', v: 'CloudPanel 2.5.4-3+clp-noble — verified via dpkg' },
  { k: 'Site types clpctl supports', v: 'PHP, Node.js, Python, Static HTML, Reverse Proxy — one clpctl site:add:* command per type' },
  { k: 'Built-in git deploy / webhook', v: "None found — clpctl has no site:git or site:deploy command; only site:add:*, site:delete, site:install:certificate, user:add" },
  { k: 'Multiple sites per VPS', v: 'Fully supported, each under its own Linux site user — this is what makes a free staging site possible (§08), no second server needed' },
  { k: 'What this means practically', v: "CloudPanel manages the web server/PHP-FPM/SSL layer well, but deploy automation (§06/§07) has to be built on top of it — there's no panel feature to turn on instead" },
];

export const GIT_WORKFLOW_STEPS = [
  { t: 'main is production, protected', d: 'Direct pushes to main are disabled. Every change lands via a pull request, even for a team of one — it forces CI to run and leaves a paper trail of what changed and why.' },
  { t: 'A staging branch, mapped to a staging site', d: 'Merges to staging deploy to the new staging environment (§08) first — real smoke-testing before anything reaches tenants.' },
  { t: 'Feature branches for actual changes', d: 'Named after the change, short-lived, merged via PR into staging first, then promoted to main once verified.' },
  { t: 'The server never authors a commit again', d: 'If an emergency hotfix has to happen live, it gets cherry-picked back into git from a real dev machine immediately after — never left as drift only the production filesystem knows about.' },
];

export const CI_STEPS = [
  { t: 'Trigger', d: 'Runs on every pull request and every push to main/staging.' },
  { t: 'Install', d: 'composer install, matching the PHP 8.4 / Laravel 10.10 versions already verified in the Tech Stack audit.' },
  { t: 'Static analysis', d: 'phpstan/larastan — catches a class of bug before it ever reaches a human reviewer.' },
  { t: 'Test', d: 'php artisan test — runs the 2 existing tests today, grows as coverage is added. A composer.json "test" script makes this a documented one-liner locally too.' },
  { t: 'Gate', d: 'Branch protection on main and staging requires this workflow to pass before merge is even allowed.' },
];

export const DEPLOY_STEPS = [
  { t: 'Dedicated deploy key, not root', d: 'A new, scoped SSH key/user generated specifically for CI to deploy with — least-privilege, and revocable independently of the root key without touching anything else.' },
  { t: 'Releases directory, not in-place pull', d: 'Each deploy lands in releases/<timestamp>/ (fresh git clone + composer install --no-dev --optimize-autoloader), not a git pull directly into the live htdocs.' },
  { t: 'Atomic cutover', d: 'A current symlink is repointed to the new release only after it is fully built and migrations have run — nginx/php-fpm always serves either the old release or the fully-ready new one, never a half-deployed state.' },
  { t: 'Cache rebuild', d: 'php artisan config:cache, route:cache, view:cache run against the new release before cutover, so the first real request is already fast.' },
  { t: 'Instant rollback', d: 'Re-point current back to the previous release directory and reload php-fpm — seconds, not a live git revert.' },
  { t: 'Prune old releases', d: 'Keep the last 5 for quick rollback, delete older ones so disk does not grow unbounded.' },
];

export const STAGING_STEPS = [
  { t: 'Same VPS, new site', d: 'clpctl site:add:php --domainName=staging.appzetbilling.com --phpVersion=8.4 ... — the box has ~90GB free disk and ~70% RAM headroom (Backup & Migration §01 live metrics); no second server needed yet.' },
  { t: 'Separate database', d: 'A dedicated staging schema, seeded from a sanitized/synthetic dataset — never a raw copy of production tenant data onto a lower-security environment.' },
  { t: 'staging branch auto-deploys here', d: 'Every merge to staging goes through the same deploy pipeline (§07) as production, just pointed at this site — proving the pipeline itself works before it ever touches real tenants.' },
  { t: 'This is where migrations get rehearsed', d: "Directly relevant to the migration-transformer plan — any schema change or import logic gets tested against staging first, not a tenant's live invoices." },
];

export const DEPLOYMENT_ROADMAP = [
  { pri: 'now', t: 'Reconcile the uncommitted changes sitting on production', d: 'Decide per file — commit properly (from a real dev machine, reviewed) or discard — before anything else. Do not build automation on top of a dirty working tree.' },
  { pri: 'now', t: 'Stop committing from the server', d: 'A one-line policy change with immediate effect: all edits happen locally or via GitHub from now on. Zero cost, closes the single biggest source-control risk found.' },
  { pri: 'now', t: 'Stand up staging on the same VPS', d: 'No new infrastructure cost — see §08. Turns "test in production" into an actual choice instead of the only option.' },
  { pri: 'soon', t: 'Add CI (GitHub Actions)', d: 'Runs the 2 existing tests plus static analysis on every PR — see §06. Free at this repo size, catches regressions before merge.' },
  { pri: 'soon', t: 'Branch protection on main and staging', d: 'Requires CI to pass and a PR before merge — see §05. Enforces the workflow instead of relying on discipline alone.' },
  { pri: 'soon', t: 'Create a scoped deploy-only SSH credential', d: 'Replaces using the root key for automated deploys — see §07. Also unblocks safely automating anything else (like the R2 backup work) without root-key sprawl.' },
  { pri: 'later', t: 'Automate deploy with releases + atomic symlink cutover', d: 'Instant rollback instead of a live git revert — see §07. Do this after staging and CI both exist and are trusted.' },
  { pri: 'later', t: 'Grow real test coverage', d: 'Require a test with every new PR going forward rather than a one-time backfill push — coverage should track new risk, not chase old code all at once.' },
  { pri: 'later', t: 'Revisit containers / multi-server only if scale demands it', d: 'Not justified today at 38 tenants and 1.4% CPU (§03 Option D) — revisit alongside the DB-split trigger already defined in Backup & Migration §12.' },
];

export const OPEN_QUESTIONS = [
  { t: 'Who owns merge approval on main once branch protection is on?', d: "Even a team of one benefits from PRs, but someone has to be the actual approver of record — worth deciding before it blocks a routine deploy." },
  { t: 'Sanitized staging dataset — built how, refreshed how often?', d: 'Staging needs realistic data to be useful, but real tenant data should never land on a lower-security environment unmasked.' },
  { t: 'Who holds the new deploy-only SSH key?', d: 'Same custody question as the R2 backup access token in the Backup & Migration audit — needs an explicit owner and a rotation policy, not an implicit one.' },
  { t: 'Budget/time for the deploy-script build (§07)', d: "Moderate one-time effort — needs sign-off on when, given it touches how every future release reaches production." },
  { t: 'Is this repo public or private?', d: 'Directly affects how much production infrastructure detail (VPS IPs, paths, credentials handling) is safe to document here versus keep internal-only.' },
];
