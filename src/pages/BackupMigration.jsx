import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import {
  LIVE_METRICS, ARCH_FACTS, DB_STATS, RISKS, OPTIONS_TABLE, STORAGE_PRICING, TENANCY_QA,
  RETENTION_TABLE, PRICING_PLANS, MIGRATION_ENTITIES, MIGRATION_STEPS, SCHEMA_TABLES,
  API_ENDPOINTS, DR_TARGETS, DR_SCENARIOS, DR_PROCEDURE, COST_INPUTS, COST_SIM,
  BACKUP_ROADMAP, SECURITY_RISKS, OPEN_QUESTIONS,
  IMPLEMENTATION_STATS, IMPLEMENTATION_STEPS, TRANSFORMER_PHASES,
} from '../data/backupMigration.js';
import { PRI_LABEL } from '../data/roadmap.js';

const TOC = [
  { id: 'architecture', num: '01', label: 'Current Architecture' },
  { id: 'database', num: '02', label: 'Database Size & Structure' },
  { id: 'risks', num: '03', label: 'Backup Risks Today' },
  { id: 'options', num: '04', label: 'Backup Architecture Options' },
  { id: 'storage', num: '05', label: 'Cloud Storage Provider' },
  { id: 'tenancy', num: '06', label: 'Multi-Tenant Architecture' },
  { id: 'retention', num: '07', label: 'Data Retention Policy' },
  { id: 'pricing', num: '08', label: 'Customer Pricing Model' },
  { id: 'migration', num: '09', label: 'Migration Architecture' },
  { id: 'schema', num: '10', label: 'Schema & API Design' },
  { id: 'dr', num: '11', label: 'Disaster Recovery' },
  { id: 'cost', num: '12', label: 'Cost Simulation' },
  { id: 'roadmap', num: '13', label: 'Implementation Roadmap' },
  { id: 'security', num: '14', label: 'Security Risks' },
  { id: 'open', num: '15', label: 'Open Questions' },
  { id: 'implementation', num: '16', label: 'Implementation Log' },
];

const META = (
  <>
    Read-only Hostinger VPS API<br />
    audit + live pricing check<br />
    Hostinger VPS · Ubuntu 24.04<br />
    Investigated 2026-09-15/16
  </>
);

const SEV_LABEL2 = { crit: 'Critical', warn: 'Warning', info: 'Info' };

function VTag({ kind, children }) {
  return <span className={`vtag ${kind}`}>{children}</span>;
}

function RiskList({ items }) {
  return (
    <div className="findlist">
      {items.map((f, i) => (
        <div key={i} className="finding">
          <div className="num">{String(i + 1).padStart(2, '0')}</div>
          <div>
            <h4>{f.t} <span className={`sev sev-${f.sev}`}>{SEV_LABEL2[f.sev]}</span></h4>
            <p>{f.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Steps({ items, renderTitle }) {
  return (
    <div className="steps">
      {items.map((it, i) => (
        <div className="step" data-n={i + 1} key={i}>
          <h4>{renderTitle ? renderTitle(it) : it.t}</h4>
          <p>{it.d || it.a}</p>
        </div>
      ))}
    </div>
  );
}

export default function BackupMigration() {
  const [activeSection, setActiveSection] = useState(TOC[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveSection(en.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    TOC.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="shell">
        <Sidebar toc={TOC} activeSection={activeSection} meta={META} />
        <main>
          <div className="topband topband-bleed">
            <div className="title-row">
              <div>
                <h1>AppzetBilling — Backup &amp; Migration Blueprint</h1>
                <div className="desc">
                  A read-only audit of the live Hostinger VPS API and account catalog, cross-checked against this site's own
                  DB Architecture audit, followed by a backup, retention, pricing and migration architecture designed for
                  what was actually found — not a generic multi-tenant SaaS template. No production data, backups or
                  configuration were changed while producing the audit itself (§01–§15). §16 is the one later exception —
                  the top roadmap recommendation was actually implemented and verified against the live server on 2026-09-17.
                </div>
              </div>
              <div className="badge-date">audited 2026‑09‑15/16</div>
            </div>

            <div className="stats">
              {LIVE_METRICS.map((m) => (
                <div className="stat accent" key={m.k}><div className="num">{m.v}</div><div className="lbl">{m.k}</div></div>
              ))}
            </div>

            <StartHereCard
              items={[
                { q: "What's the biggest risk right now?", a: '§03 Backup Risks Today', href: '#risks' },
                { q: 'Where should backups actually live?', a: '§05 Cloud Storage Provider — Cloudflare R2', href: '#storage' },
                { q: 'What will this cost at scale?', a: '§12 Cost Simulation, 10 → 5,000 restaurants', href: '#cost' },
                { q: 'What do we need to build?', a: '§10 Schema & API Design', href: '#schema' },
                { q: 'What needs sign-off before anything changes?', a: '§15 Open Questions', href: '#open' },
                { q: "What's already been done?", a: '§16 Implementation Log — offsite R2 push, live since 2026-09-17', href: '#implementation' },
              ]}
              note={
                <>
                  Every figure below is tagged <VTag kind="verified">verified</VTag> (read directly off the live server or
                  account API), <VTag kind="assumption">assumption</VTag> (a stated planning input), or{' '}
                  <VTag kind="review">review</VTag> (a legal/business decision AppzetBilling has to make, not a technical fact).
                </>
              }
            />
          </div>

          <section id="architecture">
            <div className="eyebrow">01 · Current Architecture <VTag kind="verified">verified</VTag></div>
            <h2>What's actually running</h2>
            <p className="lede">
              AppzetBilling is a PHP/Laravel monolith on one Hostinger VPS — no containers, no CI/CD. Confirmed live via the
              Hostinger VPS API and this repo's own on-server audit (composer.json, .env, php -v, direct greps, 2026‑09‑13/14).
            </p>
            <table className="facts" style={{ marginTop: 16 }}>
              <tbody>
                {ARCH_FACTS.map((f) => (
                  <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flagbar">
              <div className="flag info">
                <div className="ic">WHY IT MATTERS</div>
                <p>
                  A monolith with a queue that doesn't run and a scheduler that never fires means the backup architecture in
                  §04 can't assume "just add a scheduled job" — fixing the scheduler is a day-zero prerequisite (§13), not an
                  afterthought.
                </p>
              </div>
            </div>
          </section>

          <section id="database">
            <div className="eyebrow">02 · Database Size &amp; Structure <VTag kind="verified">verified</VTag></div>
            <h2>One database, every tenant</h2>
            <p className="lede">
              There is no database-per-restaurant and no schema-per-restaurant — isolation is enforced entirely at the row
              level via a <code>business_id</code> column present on roughly 50 of the ~65 tables, almost all{' '}
              <code>NOT NULL</code> with <code>ON DELETE CASCADE</code> back to <code>businesses.id</code>.
            </p>
            <div className="stats">
              {DB_STATS.map((s) => (
                <div className="stat" key={s.k}><div className="num">{s.v}</div><div className="lbl">{s.k}{s.u ? ` · ${s.u}` : ''}</div></div>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              Every other table sits in the tens-to-low-hundreds of rows, which bounds the whole database confidently to the{' '}
              <strong>tens of megabytes</strong>, not gigabytes — an early-stage system by data volume, whatever the ambition
              for tenant count. <VTag kind="review">review</VTag> an exact byte count needs a direct <code>SHOW TABLE STATUS</code> against
              the live server, which wasn't available to this session (no SSH/SQL access — only the Hostinger account API and
              this repo's prior audit).
            </p>
            <div className="flagbar">
              <div className="flag crit">
                <div className="ic">ISOLATION BUG</div>
                <p>
                  <b>coupons.code</b> and <b>parties.phone</b> are both globally <code>UNIQUE</code> despite{' '}
                  <code>business_id</code> being <code>NOT NULL</code> on both — two tenants cannot independently reuse a
                  coupon code or contact phone. Not a data leak, but it will break any per-tenant logical export/import (§09–10)
                  on a unique-key collision. Fix to a composite <code>(business_id, code)</code> / <code>(business_id, phone)</code>{' '}
                  index before building tenant-scoped tooling.
                </p>
              </div>
            </div>
          </section>

          <section id="risks">
            <div className="eyebrow">03 · Backup Risks Today</div>
            <h2>What happens if something goes wrong right now</h2>
            <p className="lede">Before any recommendation below is implemented — the state of things as audited.</p>
            <RiskList items={RISKS} />
          </section>

          <section id="options">
            <div className="eyebrow">04 · Backup Architecture Options</div>
            <h2>Four approaches, evaluated against real scale</h2>
            <p className="lede">Not a generic SaaS comparison — weighed against AppzetBilling's actual stack and data volume.</p>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Criterion</th>{OPTIONS_TABLE.cols.map((c) => <th className="wrap" key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {OPTIONS_TABLE.rows.map((r) => (
                    <tr key={r.label} className={r.label === 'Verdict' ? 'hl' : undefined}>
                      <td>{r.label}</td>
                      {r.vals.map((v, i) => (
                        <td className="wrap" key={i}>
                          {r.sevs ? <span className={`sev sev-${r.sevs[i]}`}>{v}</span> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              Option C only becomes worth revisiting once backup volume makes a dedicated box cheaper than object storage per
              GB — at the scales modeled in §12 (up to 5,000 restaurants), it never crosses that line. Option D costs the same
              as Option B plus keeping infrastructure that's already paid for and already working.
            </p>
          </section>

          <section id="storage">
            <div className="eyebrow">05 · Cloud Storage Provider <VTag kind="verified">pricing verified 2026-09-15</VTag></div>
            <h2>Cloudflare R2, for one reason above the others</h2>
            <p className="lede">Official pricing pages, fetched live for this audit.</p>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th>Provider</th><th>Storage / GB-mo</th><th className="wrap">Egress</th><th className="wrap">Writes</th><th className="wrap">Reads</th><th>S3 compatible</th><th className="wrap">Free tier</th></tr></thead>
                <tbody>
                  {STORAGE_PRICING.map((p) => (
                    <tr key={p.provider} className={p.highlight ? 'hl' : undefined}>
                      <td><strong>{p.provider}</strong></td><td>{p.storage}</td><td className="wrap">{p.egress}</td>
                      <td className="wrap">{p.writes}</td><td className="wrap">{p.reads}</td><td>{p.s3}</td><td className="wrap">{p.free}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              <strong>Cloudflare R2 as the primary offsite tier.</strong> S3-compatible (any S3 SDK/CLI/Laravel filesystem
              driver works with an endpoint-URL change), storage ~35% below S3 — but the number that actually matters for a
              backup workload is <strong>zero egress fees</strong>. Every other option charges to download the thing a
              restore needs to download, which is exactly what makes routine restore-testing (§11) something you can afford
              to actually do on a schedule. Backblaze B2 is the credible second opinion for a cold-archive second copy, per
              the 3-2-1 rule. <VTag kind="review">review</VTag> confirm exact pricing and commitment terms at signup.
            </p>
          </section>

          <section id="tenancy">
            <div className="eyebrow">06 · Multi-Tenant Architecture</div>
            <h2>Nine tenancy questions, answered against what's built</h2>
            <p className="lede">Not a rewrite — the shared-database design already running is the right one for this stage.</p>
            <Steps items={TENANCY_QA} renderTitle={(it) => it.q} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag ok">
                <div className="ic">RECOMMENDATION</div>
                <p>
                  Keep the shared-database, <code>business_id</code>-scoped architecture. It is not the constraint on scaling
                  to thousands of restaurants — compute/I-O capacity on a single VPS is (§12). Database-per-tenant would trade
                  a real, current backup/isolation problem for a much larger provisioning problem, with no benefit at this
                  data volume.
                </p>
              </div>
            </div>
          </section>

          <section id="retention">
            <div className="eyebrow">07 · Data Retention Policy</div>
            <h2>Two separate decisions, easy to conflate</h2>
            <p className="lede">How long a tenant's data stays visible in the app, vs. how long a backup copy exists as a safety net.</p>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th>Window</th><th className="wrap">Storage cost</th><th className="wrap">Performance impact</th><th className="wrap">Fits</th></tr></thead>
                <tbody>
                  {RETENTION_TABLE.map((r) => (
                    <tr key={r.window}><td>{r.window}</td><td className="wrap">{r.cost}</td><td className="wrap">{r.perf}</td><td className="wrap">{r.fits}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag crit">
                <div className="ic">NEEDS REVIEW</div>
                <p>
                  Invoice/transaction retention is set by tax and accounting law per jurisdiction each restaurant operates
                  in — AppzetBilling already spans multiple gateways/currencies (Stripe, Razorpay, Mollie, PayTM, PhonePe),
                  implying multiple jurisdictions. <strong>No specific number here — including the commonly-cited 6–8 year
                  range for India — is verified legal advice for every market served.</strong> Confirm minimums with a
                  qualified accountant/lawyer per market before publishing any plan-tier deletion promise.
                </p>
              </div>
            </div>
            <h3 style={{ marginTop: 26 }}>Recommended default, pending the review above</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--ink-soft)', fontSize: '.9rem' }}>
              <li><strong>In-app historical data</strong> — tiered by plan (§08): a feature limit on what's shown, not a data-loss event. Older data is archived, not deleted.</li>
              <li><strong>Backup retention</strong> — independent of plan tier: 7 days local + 90 days rolling offsite + 12 monthly snapshots for 1 year, for every tenant regardless of plan.</li>
              <li><strong>Hard deletion</strong> — only on explicit, confirmed offboarding, and only after minimum legal retention has elapsed. Never on a plan downgrade alone.</li>
            </ul>
          </section>

          <section id="pricing">
            <div className="eyebrow">08 · Customer Pricing Model <VTag kind="assumption">illustrative INR pricing</VTag></div>
            <h2>Backup protection is baseline, not an upsell</h2>
            <p className="lede">
              What's tiered is history depth, restore convenience, and dedicated infrastructure — not the daily backup or the
              first restore, per §12's cost model.
            </p>
            <div className="pricetier">
              {PRICING_PLANS.map((p) => (
                <div className={`tier${p.featured ? ' featured' : ''}`} key={p.name}>
                  <div className="name">{p.name}</div>
                  <div className="price">{p.price}<span className="per">{p.per}</span></div>
                  <ul>{p.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              What's deliberately <em>not</em> charged for: the baseline daily backup, the 90-day offsite copy, or a first
              restore — these cost fractions of a rupee per tenant per month at every scale modeled in §12. What's charged:
              history beyond the included window (real, ongoing cost), and restores beyond the included allowance (support
              effort, not storage — R2's zero egress makes the restore itself nearly free).
            </p>
          </section>

          <section id="migration">
            <div className="eyebrow">09 · Migration Architecture</div>
            <h2>Bringing existing data in without corrupting AppzetBilling's own</h2>
            <h3>What has to survive the move</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Source entity</th><th className="wrap">Maps to</th><th className="wrap">Relationship that must not break</th></tr></thead>
                <tbody>
                  {MIGRATION_ENTITIES.map((r) => (
                    <tr key={r.src}><td className="wrap">{r.src}</td><td className="wrap"><code>{r.maps}</code></td><td className="wrap">{r.rel}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: 26 }}>Recommended workflow</h3>
            <Steps items={MIGRATION_STEPS} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag ok">
                <div className="ic">RECOMMENDED APPROACH</div>
                <p>
                  A backend migration service run by a queue worker, with AI-assisted mapping and a human confirmation step —
                  not a one-shot manual CSV importer, and not a fully-automatic no-review pipeline. Manual doesn't scale past
                  a handful of onboardings; full automation is unsafe for financial records with real regulatory weight.
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Real-world trigger: a Petpooja migration request</h3>
            <p style={{ marginTop: 8 }}>
              This section stopped being theoretical when an actual Petpooja user asked to move their data in. Petpooja is
              closed SaaS — no direct database access — so what a merchant can actually hand over is Excel/CSV exports from
              their own back-office <strong>Reports</strong> screen: typically an Item Master, a Customer/Party Master, a
              Sales Register, and Purchase/Inventory reports. Their column names won't match AppzetBilling's, and won't for
              the next POS system either — which is why the tool below maps columns instead of hardcoding against one
              source, and why it's built in phases rather than as one big wizard.
            </p>
            <h3 style={{ marginTop: 26 }}>Build order — the transformer first, the full wizard second</h3>
            <p className="lede">Ships value at Phase 1 without waiting on the queue worker or staging tables.</p>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Phase</th><th className="wrap">Scope</th><th className="wrap">What it builds</th></tr></thead>
                <tbody>
                  {TRANSFORMER_PHASES.map((p) => (
                    <tr key={p.phase}><td className="wrap"><strong>{p.phase}</strong></td><td className="wrap">{p.scope}</td><td className="wrap">{p.build}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">STATUS</div>
                <p>
                  Plan only — no code exists yet. Deliberately deferred; see §13 "later" for where this sits in priority.
                  Needs the actual AppzetBilling app repo (not this docs site) plus a real Petpooja export sample before
                  Phase 1 can start.
                </p>
              </div>
            </div>
          </section>

          <section id="schema">
            <div className="eyebrow">10 · Schema &amp; API Design</div>
            <h2>New tables only — nothing existing changes</h2>
            <p className="lede">Column conventions (bigint unsigned ids, business_id cascade, timestamps) match the app's existing schema, confirmed in §02.</p>
            {SCHEMA_TABLES.map((t) => (
              <div className="card pad" style={{ marginTop: 16 }} key={t.name}>
                <h4 style={{ fontFamily: 'var(--mono)', fontSize: '.92rem', marginBottom: 4 }}>{t.name}</h4>
                <div className="pkline">PK <code>{t.pk}</code> · FK {t.fks} · Index {t.idx}</div>
                <p style={{ fontSize: '.86rem', margin: '8px 0 10px' }}>{t.purpose}</p>
                <div className="collist">
                  <div className="colrow colrow-head"><div>Column</div><div>Type</div><div>Key</div><div>Null</div><div>Purpose</div></div>
                  {t.cols.map((c, i) => (
                    <div className="colrow" key={i}>
                      <div className="colname">{c[0]}</div>
                      <div className="coltype">{c[1]}</div>
                      <div>{c[2] && <span className="colflag pk">{c[2]}</span>}</div>
                      <div className="colextra">{c[3]}</div>
                      <div className="colextra">{c[4]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <h3 style={{ marginTop: 28 }}>API design</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th>Method</th><th className="wrap">Endpoint</th><th className="wrap">Purpose</th></tr></thead>
                <tbody>
                  {API_ENDPOINTS.map((e, i) => (
                    <tr key={i}><td><code>{e.m}</code></td><td className="wrap"><code>{e.p}</code></td><td className="wrap">{e.d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="dr">
            <div className="eyebrow">11 · Disaster Recovery</div>
            <h2>RPO/RTO grounded in a measured restore time</h2>
            <div className="stats">
              {DR_TARGETS.map((s) => (
                <div className="stat" key={s.k}><div className="num">{s.v}</div><div className="lbl">{s.k}</div></div>
              ))}
            </div>
            <h3 style={{ marginTop: 24 }}>Scenario coverage</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Scenario</th><th className="wrap">Recovery path</th></tr></thead>
                <tbody>
                  {DR_SCENARIOS.map((s) => (
                    <tr key={s.s}><td className="wrap">{s.s}</td><td className="wrap">{s.p}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: 26 }}>Restoring one restaurant without touching the other 37 — today</h3>
            <p className="lede">Until §10's per-tenant export capability ships, this is a manual procedure, not a button.</p>
            <Steps items={DR_PROCEDURE} />
          </section>

          <section id="cost">
            <div className="eyebrow">12 · Cost Simulation</div>
            <h2>10 → 5,000 restaurants, in INR</h2>
            <p className="lede">
              <VTag kind="verified">verified</VTag> VPS pricing is AppzetBilling's real Hostinger catalog price, fetched
              live. <VTag kind="assumption">assumption</VTag> per-tenant data volume is modeled for a mature restaurant after
              ~12 months of real use — deliberately higher than today's actual 38-tenant dataset (§02).
            </p>
            <h3>Model inputs</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Input</th><th>Value</th><th className="wrap">Basis</th></tr></thead>
                <tbody>
                  {COST_INPUTS.map((r) => (
                    <tr key={r.i}><td className="wrap">{r.i}</td><td>{r.v}</td><td className="wrap">{r.b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: 24 }}>Simulation</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th>Restaurants</th><th>Primary DB</th><th className="wrap">Daily backup</th><th className="wrap">Offsite stored</th><th className="wrap">R2 cost</th><th className="wrap">VPS tier</th><th className="wrap">Monthly infra</th><th>Per restaurant</th></tr></thead>
                <tbody>
                  {COST_SIM.map((r) => (
                    <tr key={r.r}>
                      <td>{r.r}</td><td>{r.db}</td><td className="wrap">{r.backup}</td><td className="wrap">{r.offsite}</td>
                      <td className="wrap">{r.r2}</td><td className="wrap">{r.vps}</td><td className="wrap">{r.infra}</td><td>{r.per}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">READING THIS TABLE</div>
                <p>
                  Offsite backup storage is never the cost driver — it stays under 2% of total infra cost throughout, because
                  R2's egress-free pricing makes the hybrid architecture (§04) nearly free to run. <strong>Compute is the real
                  constraint, and it arrives earlier than storage does.</strong> Today's 38-tenant load measured only ~1.5% CPU
                  and ~30% RAM on a single KVM 2 — comfortable headroom for perhaps 150–250 tenants at similar intensity before
                  DB and web traffic contend for the same 2 vCPUs. The 5,000-restaurant row is illustrative only — at that
                  scale, single-instance MySQL-on-VPS is the wrong architecture regardless of backup strategy (§15).
                </p>
              </div>
            </div>
          </section>

          <section id="roadmap">
            <div className="eyebrow">13 · Implementation Roadmap</div>
            <h2>Ordered by dependency, not just priority</h2>
            <p className="lede">Several backup/migration items are blocked on existing engineering-roadmap items until those land.</p>
            {['now', 'soon', 'later'].map((pri) => (
              <div key={pri} style={{ marginTop: pri === 'now' ? 16 : 26 }}>
                <h3>{PRI_LABEL[pri]}</h3>
                <div className="gapcard">
                  {BACKUP_ROADMAP.filter((r) => r.pri === pri).map((r) => (
                    <div key={r.t} className="card pad">
                      <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: 6 }}>
                        {r.t} {r.done && <VTag kind="verified">done · §16</VTag>}
                      </div>
                      <p className="tight" style={{ fontSize: '.85rem', color: 'var(--ink-soft)', margin: 0 }}>{r.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section id="security">
            <div className="eyebrow">14 · Security Risks</div>
            <h2>Findings that bear on backup, tenancy, or the new migration surface</h2>
            <RiskList items={SECURITY_RISKS} />
          </section>

          <section id="open">
            <div className="eyebrow">15 · Open Questions</div>
            <h2>Decisions only AppzetBilling can make</h2>
            <p className="lede">Nothing in this document has been acted on.</p>
            <Steps items={OPEN_QUESTIONS} />
          </section>

          <section id="implementation">
            <div className="eyebrow">16 · Implementation Log <VTag kind="verified">live as of 2026-09-17</VTag></div>
            <h2>The §13 "now" item, actually shipped</h2>
            <p className="lede">
              Everything in §01–§15 is the original read-only audit (2026-09-15/16) — nothing on the server was touched
              while producing it. This section is the one exception: "stand up the offsite copy" was implemented and
              verified against the live production VPS on 2026-09-17, not just planned.
            </p>
            <div className="stats">
              {IMPLEMENTATION_STATS.map((s) => (
                <div className="stat accent" key={s.k}><div className="num">{s.v}</div><div className="lbl">{s.k} · {s.u}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <Steps items={IMPLEMENTATION_STEPS} />
            </div>
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag warn">
                <div className="ic">STILL OPEN</div>
                <p>
                  This closes only the <em>location</em> half of §14's top risk ("backups are unencrypted and
                  single-location") — the R2 copies are exact, unencrypted gzip dumps, same as the local ones. Encryption
                  before upload, and object-versioning/immutability on the R2 bucket (§13 "soon" — closes the ransomware
                  gap in §11), are both deliberately not done yet, pending a decision on approach.
                </p>
              </div>
            </div>
          </section>

          <footer>
            AppzetBilling Backup &amp; Migration Blueprint · compiled from a live, read-only Hostinger VPS API audit (2026‑09‑15/16)
            and this repo's own DB Architecture / Tech Stack / Known Issues audits (2026‑09‑13/14) · no production data,
            backups, or configuration were changed for the audit itself · §16 documents the one later exception — the
            offsite R2 backup push, implemented and verified live on 2026‑09‑17
          </footer>
        </main>
      </div>
    </>
  );
}
