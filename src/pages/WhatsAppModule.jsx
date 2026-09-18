import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import Mermaid from '../components/Mermaid.jsx';
import {
  STATS, STACK_FACTS, TENANT_MODEL, BILL_PATH, CUSTOMER_CONTACT, NOTIFICATION_FACTS,
  PLAN_LIMIT_FACTS, API_CONVENTIONS, VPS_FACTS, WHATSAPP_PRICING, MESSAGING_LIMITS_NOTE,
  EMBEDDED_SIGNUP_FACTS, TEMPLATE_RULES_NOTE, WEBHOOK_MEDIA_NOTE, ARCHITECTURE_TABLE, ARCH_DIAGRAM,
  MVP_FEATURES, PHASE2_FEATURES, PHASE3_FEATURES, CODEBASE_IMPACT, DB_TABLES, IDEMPOTENCY_NOTES,
  QUEUE_NOTE, SERVICE_LAYER, SENDING_FLOW, WEBHOOK_PROCESSING, ERROR_CLASSIFICATION, ROUTES_TABLE,
  TENANT_DASHBOARD, BILL_SCREEN_CAVEAT, BILL_SCREEN, SAAS_ADMIN, SCALE_100, SCALE_1000,
  NOT_JUSTIFIED_NOTE, BILLING_MODELS, WORKED_EXAMPLE, COST_PREVENTION_NOTE, SECURITY_ITEMS,
  TESTING_ITEMS, SANDBOX_NOTE, MILESTONES, FINAL_RECOMMENDATION, SOURCES,
} from '../data/whatsapp.js';

const TOC = [
  { id: 'discovery', num: '01', label: "What's Running (VPS)" },
  { id: 'platform', num: '02', label: 'WhatsApp Platform Rules' },
  { id: 'architecture', num: '03', label: 'Multi-Tenant Architecture' },
  { id: 'features', num: '04', label: 'Feature Roadmap' },
  { id: 'impact', num: '05', label: 'Codebase Impact' },
  { id: 'database', num: '06', label: 'Database Design' },
  { id: 'backend', num: '07', label: 'Backend & API Design' },
  { id: 'frontend', num: '08', label: 'Frontend & Admin Dashboard' },
  { id: 'infra', num: '09', label: 'Infrastructure Feasibility' },
  { id: 'cost', num: '10', label: 'Cost & Pricing Model' },
  { id: 'security', num: '11', label: 'Security & Compliance' },
  { id: 'testing', num: '12', label: 'Testing Strategy' },
  { id: 'roadmap', num: '13', label: 'Implementation Roadmap' },
  { id: 'recommendation', num: '14', label: 'Final Recommendation' },
  { id: 'sources', num: '15', label: 'Sources' },
];

const META = (
  <>
    Live, read-only SSH check<br />
    of the production VPS +<br />
    official Meta docs research<br />
    Investigated 2026-09-18
  </>
);

function VTag({ kind, children }) {
  return <span className={`vtag ${kind}`}>{children}</span>;
}

function Steps({ items, renderTitle }) {
  return (
    <div className="steps">
      {items.map((it, i) => (
        <div className="step" data-n={i + 1} key={i}>
          <h4>{renderTitle ? renderTitle(it) : it.t}</h4>
          <p>{it.d}</p>
        </div>
      ))}
    </div>
  );
}

function DTable({ table }) {
  return (
    <div className="dtwrap">
      <table className="dtable">
        <thead><tr><th className="wrap">Feature</th>{table.cols.map((c) => <th className="wrap" key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.label} className={r.label === 'Verdict' ? 'hl' : undefined}>
              <td className="wrap">{r.label}</td>
              {r.vals.map((v, i) => (
                <td className="wrap" key={i}>{r.sevs ? <span className={`sev sev-${r.sevs[i]}`}>{v}</span> : v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WhatsAppModule() {
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
                <h1>AppzetBilling — WhatsApp Business Module</h1>
                <div className="desc">
                  Feasibility analysis and implementation roadmap for a WhatsApp module that lets each restaurant
                  tenant send bills, payment confirmations, and (later) marketing messages to its customers. Feasible
                  with no rewrite — recommended path is Option B: each tenant connects its own WhatsApp number via
                  Meta's Embedded Signup, starting with an MVP that sends the bill PDF and payment confirmation. A
                  pre-existing queue/scheduler gap found live on the VPS must be fixed first, or queued sends would
                  silently never go out.
                </div>
              </div>
              <div className="badge-date">analyzed 2026‑09‑18</div>
            </div>

            <div className="stats">
              {STATS.map((m) => (
                <div className="stat accent" key={m.k}><div className="num">{m.v}</div><div className="lbl">{m.k}</div></div>
              ))}
            </div>

            <StartHereCard
              items={[
                { q: "What's actually running today?", a: '§01 What’s Running (VPS)', href: '#discovery' },
                { q: 'Which architecture should we build?', a: '§03 Multi-Tenant Architecture', href: '#architecture' },
                { q: 'What ships in the MVP?', a: '§04 Feature Roadmap', href: '#features' },
                { q: 'What will this cost?', a: '§10 Cost & Pricing Model', href: '#cost' },
                { q: 'What order do we build this in?', a: '§13 Implementation Roadmap', href: '#roadmap' },
                { q: 'What should we do, and what’s still missing?', a: '§14 Final Recommendation', href: '#recommendation' },
              ]}
              note={
                <>
                  Built from a live, read-only SSH inspection of the production VPS (nothing was modified) plus
                  official Meta developer-docs research, fetched and dated in <a href="#sources">§15 Sources</a>.
                  No production code, migrations, or dependencies were changed to produce this.
                </>
              }
            />
          </div>

          <section id="discovery">
            <div className="eyebrow">01 · What's Running <VTag kind="verified">verified live, 2026-09-18</VTag></div>
            <h2>Discovered on the VPS, not assumed</h2>
            <p className="lede">
              Connected to the production VPS (Hostinger, srv-example, CloudPanel) and read the live app at
              /home/SITE_USER/htdocs — read-only, nothing below was modified.
            </p>
            <table className="facts" style={{ marginTop: 16 }}>
              <tbody>{STACK_FACTS.map((f) => <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>)}</tbody>
            </table>

            <h3 style={{ marginTop: 26 }}>Tenant model — the actual multi-tenancy</h3>
            <Steps items={TENANT_MODEL} />

            <h3 style={{ marginTop: 26 }}>The exact bill-generation code path</h3>
            <Steps items={BILL_PATH} />

            <h3 style={{ marginTop: 26 }}>Customer contact information</h3>
            <Steps items={CUSTOMER_CONTACT} />

            <h3 style={{ marginTop: 26 }}>Existing notification services</h3>
            <Steps items={NOTIFICATION_FACTS} />

            <h3 style={{ marginTop: 26 }}>Where tenant plans and usage limits live</h3>
            <Steps items={PLAN_LIMIT_FACTS} />

            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag crit">
                <div className="ic">INFRA GAP</div>
                <p>
                  No supervisor/systemd unit runs <code>php artisan queue:work</code>, and no crontab entry anywhere
                  runs <code>php artisan schedule:run</code> (checked directly: root's crontab only has
                  <code>clp-update</code>; the app user has no crontab; <code>/etc/cron.d/</code> holds only certbot,
                  CloudPanel, PHP session cleanup, Monarx, the R2 backup push, and sysstat). Yet <code>Kernel::schedule()</code>{' '}
                  registers <code>ingredient:check-low-stock</code> every minute, and <code>SendPushNotificationJob</code>{' '}
                  implements <code>ShouldQueue</code>. This predates WhatsApp — but any WhatsApp send that goes through
                  a queued job (which it should, for retries/backoff) will silently never leave the building until
                  this is fixed. See §09 and Milestone 0 in §13.
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>API conventions to reuse</h3>
            <Steps items={API_CONVENTIONS} />

            <h3 style={{ marginTop: 26 }}>VPS specs</h3>
            <table className="facts" style={{ marginTop: 16 }}>
              <tbody>{VPS_FACTS.map((f) => <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>)}</tbody>
            </table>
          </section>

          <section id="platform">
            <div className="eyebrow">02 · WhatsApp Platform Rules <VTag kind="verified">verified against Meta's docs, 2026-09-18</VTag></div>
            <h2>Current rules, not old tutorials</h2>
            <p className="lede">
              Pulled directly from developers.facebook.com/documentation/business-messaging/whatsapp — pricing and
              Embedded Signup pages fetched and read in full; template-categorization, messaging-limits and media
              pages cross-checked. See §15 for exact links.
            </p>
            <h3>Pricing (effective 1 July 2025)</h3>
            <Steps items={WHATSAPP_PRICING} />

            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">MESSAGING LIMITS — DECIDES §03</div>
                <p>{MESSAGING_LIMITS_NOTE}</p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Embedded Signup — how a tenant connects its own number</h3>
            <Steps items={EMBEDDED_SIGNUP_FACTS} />

            <h3 style={{ marginTop: 26 }}>Business verification</h3>
            <p>
              Full Meta Business Verification (document-based) typically takes 2–5 business days, up to 14 if
              documents are incomplete; two-factor authentication has been mandatory since 2024; the WhatsApp display
              name must match the tenant's real, policy-compliant business identity — rejected display names are a
              common onboarding failure.
            </p>

            <h3 style={{ marginTop: 26 }}>Message templates</h3>
            <p>{TEMPLATE_RULES_NOTE}</p>

            <h3 style={{ marginTop: 26 }}>Webhooks and media</h3>
            <p>{WEBHOOK_MEDIA_NOTE}</p>

            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag warn">
                <div className="ic">WHAT THIS RULES OUT</div>
                <p>
                  Meta's own policy restricts business-initiated messaging to templates with prior opt-in. Unofficial
                  WhatsApp Web automation, QR-session scraping, or personal-number automation is against Meta's Terms
                  of Service and can get a number permanently banned — not evaluated further here, and shouldn't be
                  considered for production regardless.
                </p>
              </div>
            </div>
          </section>

          <section id="architecture">
            <div className="eyebrow">03 · Multi-Tenant Architecture</div>
            <h2>Which option, and why</h2>
            <p className="lede">Three approaches, compared against the actual codebase and Meta's own current rules from §02.</p>
            <DTable table={ARCHITECTURE_TABLE} />

            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag ok">
                <div className="ic">RECOMMENDATION</div>
                <p>
                  Option B — tenant-owned WABA via Embedded Signup — as the default and only path for the MVP. The
                  deciding fact is §02's messaging-limit change: pooling risk and quality score per Business Portfolio
                  makes a shared central number (Option A) an unacceptable blast radius for a billing feature
                  customers depend on. Option B isolates that risk per restaurant and fits the codebase's existing
                  per-Business scoping pattern (§01) — a <code>whatsapp_connections</code> table keyed by{' '}
                  <code>business_id</code> is just another tenant-scoped table like <code>Party</code> or{' '}
                  <code>Sale</code>. Option C (a BSP) is worth revisiting only if the 10→200/week onboarding cap or
                  Embedded Signup's operational overhead becomes a real bottleneck once AppZetBilling is verified and
                  past a few hundred tenants — not before.
                </p>
              </div>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              Multi-account per tenant (a restaurant wanting two numbers, e.g. one per branch) is realistic given
              MultiBranchAddon already exists — defer it to Phase 3 (§04); MVP is one WABA connection per Business.
            </p>

            <h3 style={{ marginTop: 26 }}>Architecture (MVP)</h3>
            <Mermaid chart={ARCH_DIAGRAM} height={460} />
          </section>

          <section id="features">
            <div className="eyebrow">04 · Feature Roadmap</div>
            <h2>MVP / Phase 2 / Phase 3</h2>
            <p className="lede">Billing messages only for MVP, one tenant number, no inbox.</p>
            <DTable table={MVP_FEATURES} />

            <h3 style={{ marginTop: 26 }}>Phase 2 — rounding out transactional messaging + basic 2-way</h3>
            <DTable table={PHASE2_FEATURES} />

            <h3 style={{ marginTop: 26 }}>Phase 3 — shared inbox, marketing, and scale features</h3>
            <Steps items={PHASE3_FEATURES} />
          </section>

          <section id="impact">
            <div className="eyebrow">05 · Codebase Impact</div>
            <h2>Actual files and modules touched, not generic examples</h2>
            <p className="lede">Every row below names the real class/file this session found on the VPS — see §01.</p>
            <DTable table={CODEBASE_IMPACT} />
          </section>

          <section id="database">
            <div className="eyebrow">06 · Database Design</div>
            <h2>Schema only — no migrations written</h2>
            <p className="lede">
              Follows the app's existing conventions exactly: business_id/branch_id on every table, integer FKs, JSON{' '}
              <code>meta</code> columns where the app already prefers them over new columns.
            </p>
            {DB_TABLES.map((t) => (
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

            <h3 style={{ marginTop: 26 }}>Idempotency and duplicate-safety, specifically</h3>
            <Steps items={IDEMPOTENCY_NOTES} />

            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              Every table above carries <code>business_id</code> and, where relevant, <code>branch_id</code> — the
              same global-scope pattern (<code>DataManager</code>, <code>BranchScope</code>) used by{' '}
              <code>Sale</code>/<code>Party</code>/<code>DueCollect</code> today should be applied to each of these
              new models for tenant isolation, not a bespoke <code>WHERE business_id = ?</code> scattered through
              controllers.
            </p>
          </section>

          <section id="backend">
            <div className="eyebrow">07 · Backend & API Design</div>
            <h2>Reuse the existing queue driver and route convention</h2>
            <div className="flagbar">
              <div className="flag info">
                <div className="ic">QUEUE</div>
                <p>{QUEUE_NOTE}</p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Service layer</h3>
            <Steps items={SERVICE_LAYER} />

            <h3 style={{ marginTop: 26 }}>Sending flow</h3>
            <Steps items={SENDING_FLOW} />

            <h3 style={{ marginTop: 26 }}>Webhook processing</h3>
            <Steps items={WEBHOOK_PROCESSING} />

            <h3 style={{ marginTop: 26 }}>Error classification</h3>
            <Steps items={ERROR_CLASSIFICATION} />

            <h3 style={{ marginTop: 26 }}>REST endpoints — following the existing routes/api.php v1 convention</h3>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th>Method</th><th className="wrap">Endpoint</th><th className="wrap">Purpose</th></tr></thead>
                <tbody>
                  {ROUTES_TABLE.map((e, i) => (
                    <tr key={i}><td><code>{e.m}</code></td><td className="wrap"><code>{e.p}</code></td><td className="wrap">{e.d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              <strong>Auth/tenant isolation</strong>: identical to every other v1 route — <code>auth:sanctum</code>{' '}
              resolves the User, business_id scoping happens automatically via model global scopes, <code>active.branch</code>{' '}
              resolves branch context. No new auth mechanism needed. <strong>Idempotency</strong>: the send-bill
              endpoint is safe to call twice — the job's idempotency key (§06) makes a second call a no-op that
              returns the existing message's status rather than erroring.
            </p>
          </section>

          <section id="frontend">
            <div className="eyebrow">08 · Frontend & Admin Dashboard</div>
            <h2>Extends the existing Blade + Alpine.js admin panel</h2>
            <div className="flagbar">
              <div className="flag warn">
                <div className="ic">CAVEAT</div>
                <p>{BILL_SCREEN_CAVEAT}</p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Restaurant (tenant) admin dashboard</h3>
            <Steps items={TENANT_DASHBOARD} />

            <h3 style={{ marginTop: 26 }}>Bill screen (in whichever client actually renders it)</h3>
            <Steps items={BILL_SCREEN} />

            <h3 style={{ marginTop: 26 }}>SaaS admin dashboard (the AppZetBilling operator's own view)</h3>
            <Steps items={SAAS_ADMIN} />

            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              All of the above reuses the existing Blade + Alpine.js admin UI and its current component/layout
              conventions (<code>resources/views/admin/components</code>, <code>layouts</code>) — nothing here calls
              for a new frontend framework or a parallel disconnected dashboard.
            </p>
          </section>

          <section id="infra">
            <div className="eyebrow">09 · Infrastructure Feasibility</div>
            <h2>The VPS is sufficient — the missing piece is a process, not capacity</h2>
            <p className="lede">
              2 vCPU, 7.8GB RAM, 96GB disk (87GB free). WhatsApp sending is a lightweight, bursty, I/O-bound workload
              (an HTTPS call to Meta + a PDF render), not compute-heavy — the binding constraint is process/scheduling
              correctness, not raw capacity, at either scale below.
            </p>
            <h3>At ~100 restaurants</h3>
            <Steps items={SCALE_100} />
            <h3 style={{ marginTop: 26 }}>At 1,000 restaurants</h3>
            <Steps items={SCALE_1000} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">NOT JUSTIFIED, AT EITHER SCALE</div>
                <p>{NOT_JUSTIFIED_NOTE}</p>
              </div>
            </div>
          </section>

          <section id="cost">
            <div className="eyebrow">10 · Cost & Pricing Model <VTag kind="assumption">illustrative figures</VTag></div>
            <h2>Subscription + usage-based add-on, on top of the existing Plan model</h2>
            <Steps items={BILLING_MODELS} />
            <h3 style={{ marginTop: 26 }}>Worked example (assumptions clearly marked — not Meta's actual current rates)</h3>
            <DTable table={WORKED_EXAMPLE} />
            <p style={{ marginTop: 12, maxWidth: 'none', fontSize: '.85rem' }}>
              This table shows the shape of the model, not AppZetBilling's actual P&amp;L — replace the marked
              assumption rows with real numbers once actual send volume and the tenant base's country mix are known
              post-launch.
            </p>
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag crit">
                <div className="ic">PREVENTING COST LEAKAGE</div>
                <p>{COST_PREVENTION_NOTE}</p>
              </div>
            </div>
          </section>

          <section id="security">
            <div className="eyebrow">11 · Security & Compliance</div>
            <h2>What's specific to restaurant billing data and WhatsApp messaging</h2>
            <Steps items={SECURITY_ITEMS} />
          </section>

          <section id="testing">
            <div className="eyebrow">12 · Testing Strategy</div>
            <h2>Sandbox before production messaging — no shortcuts</h2>
            <Steps items={TESTING_ITEMS} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag ok">
                <div className="ic">ROLLOUT SEQUENCE</div>
                <p>{SANDBOX_NOTE}</p>
              </div>
            </div>
          </section>

          <section id="roadmap">
            <div className="eyebrow">13 · Implementation Roadmap</div>
            <h2>Six milestones, ordered by dependency</h2>
            <p className="lede">Nothing below has been built yet — sign-off needed on Milestone 0 before anything starts.</p>
            {MILESTONES.map((m) => (
              <div className="card pad" style={{ marginTop: 16 }} key={m.n}>
                <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8 }}>Milestone {m.n} — {m.t}</div>
                <table className="facts">
                  <tbody>
                    <tr><td>Objective</td><td>{m.objective}</td></tr>
                    <tr><td>Files/modules</td><td>{m.files}</td></tr>
                    <tr><td>Database</td><td>{m.database}</td></tr>
                    <tr><td>Backend</td><td>{m.backend}</td></tr>
                    <tr><td>Frontend</td><td>{m.frontend}</td></tr>
                    <tr><td>Testing</td><td>{m.testing}</td></tr>
                    <tr><td>Deployment</td><td>{m.deployment}</td></tr>
                    <tr><td>Dependencies</td><td>{m.dependencies}</td></tr>
                    <tr><td>Rollback</td><td>{m.rollback}</td></tr>
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          <section id="recommendation">
            <div className="eyebrow">14 · Final Recommendation</div>
            <h2>Based on the actual project, not a generic template</h2>
            <Steps items={FINAL_RECOMMENDATION} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">SCOPE OF THIS REPORT</div>
                <p>
                  No production code, migrations, or dependencies were changed to produce this report — everything
                  above is read-only findings plus a design proposal. Nothing here should be implemented without
                  explicit go-ahead on Milestone 0 first.
                </p>
              </div>
            </div>
          </section>

          <section id="sources">
            <div className="eyebrow">15 · Sources</div>
            <h2>Meta platform research, checked 2026-09-18</h2>
            <div className="dtwrap">
              <table className="dtable">
                <thead><tr><th className="wrap">Page</th><th className="wrap">What it verified</th></tr></thead>
                <tbody>
                  {SOURCES.map((s) => (
                    <tr key={s.u}>
                      <td className="wrap"><a href={s.u} target="_blank" rel="noreferrer">{s.t}</a></td>
                      <td className="wrap">{s.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>
              Everything else in this report (stack, schema, code paths, VPS state) is first-hand from a read-only SSH
              inspection of the production VPS, not from these sources.
            </p>
          </section>

          <footer>
            AppzetBilling WhatsApp Business Module · compiled from a live, read-only SSH inspection of the production
            VPS and official Meta developer-docs research (2026‑09‑18) · no production code, migrations, or
            dependencies were changed to produce this analysis
          </footer>
        </main>
      </div>
    </>
  );
}
