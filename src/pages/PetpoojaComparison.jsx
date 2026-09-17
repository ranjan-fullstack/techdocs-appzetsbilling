import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import Mermaid from '../components/Mermaid.jsx';
import {
  STATS, PETPOOJA_CATEGORIES, PETPOOJA_CAVEAT, APPZET_CAPABILITIES, APPZET_ABSENT_NOTE,
  GAP_TABLE, ARCH_POINTS, ARCH_DIAGRAM, FOLDER_STRUCTURE, ARCH_NOTE, OWN_CHANNEL_NOTE,
  DELIVERY_PLATFORMS, DELIVERY_COMMERCIAL_NOTE, DELIVERY_REMAINING_GAPS, WHATSAPP_SUMMARY,
  WHATSAPP_REFERENCE_NOTE, PAYMENT_EXISTING_NOTE, PAYMENT_GAP_NOTE, PAYMENT_PROVIDERS,
  PAYMENT_RECOMMENDATION, PAYMENT_MERCHANT_NOTE, INVENTORY_BUILT_NOTE, INVENTORY_GAPS,
  INVENTORY_CLOSING_NOTE, DB_ENTITIES, DB_CLOSING_NOTE, API_ROUTES_CODE, API_CONVENTION_NOTE,
  API_SERVICES_NOTE, API_JOBS_NOTE, API_IDEMPOTENCY_NOTE, FRONTEND_TABLE, FRONTEND_NOTE,
  SECURITY_ITEMS, MONETIZATION_TABLE, MONETIZATION_BASIS_NOTE, PRICING_NOTE, COST_CATEGORIES_NOTE,
  PHASES, TECHNICAL_RISKS, VENDOR_QUESTIONS, NEXT_STEPS, FILES_INSPECTED_NOTE, ASSUMPTIONS,
  UNVERIFIED_CLAIMS, SOURCES,
} from '../data/petpooja.js';

const TOC = [
  { id: 'benchmark', num: '01', label: 'Petpooja Feature Benchmark' },
  { id: 'inventory', num: '02', label: 'AppZetBilling Feature Inventory' },
  { id: 'gaps', num: '03', label: 'Feature Gap Table' },
  { id: 'architecture', num: '04', label: 'Integration Architecture' },
  { id: 'delivery', num: '05', label: 'Delivery & Online-Ordering' },
  { id: 'whatsapp', num: '06', label: 'WhatsApp Feasibility' },
  { id: 'payments', num: '07', label: 'Payment Feasibility' },
  { id: 'kitchen', num: '08', label: 'Inventory & Kitchen Roadmap' },
  { id: 'database', num: '09', label: 'Database Changes' },
  { id: 'backend', num: '10', label: 'Backend API Changes' },
  { id: 'frontend', num: '11', label: 'Frontend & Admin Dashboard' },
  { id: 'security', num: '12', label: 'Security & Compliance' },
  { id: 'monetization', num: '13', label: 'Subscription & Monetization' },
  { id: 'roadmap', num: '14', label: 'Development Roadmap' },
  { id: 'risks', num: '15', label: 'Technical Risks' },
  { id: 'vendor', num: '16', label: 'Vendor Questions' },
  { id: 'next', num: '17', label: 'Recommended Next Steps' },
  { id: 'sources', num: '18', label: 'Files, Assumptions & Sources' },
];

const META = (
  <>
    Live, read-only SSH check<br />
    of the production VPS +<br />
    Petpooja / delivery / payment<br />
    platform research<br />
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
            <tr key={r.label}>
              <td className="wrap">{r.label}</td>
              {r.vals.map((v, i) => <td className="wrap" key={i}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PetpoojaComparison() {
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
                <h1>AppzetBilling vs Petpooja — Capability Gap Analysis</h1>
                <div className="desc">
                  AppZetBilling already covers a large share of Petpooja's customer-facing capability set — POS
                  billing, KOT/kitchen routing, cash register shifts, recipe-based stock deduction, a full
                  restaurant-branded online ordering storefront with reservations, coupons, and per-tenant payment
                  gateways. The real gaps are aggregator delivery-platform integration (partner-gated, not open
                  APIs), WhatsApp messaging, batch/expiry inventory tracking, and loyalty/marketing depth. No
                  Petpooja integration is proposed anywhere below — every recommendation is for AppZetBilling to
                  build the equivalent capability itself.
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
                { q: 'What does Petpooja actually offer?', a: '§01 Petpooja Feature Benchmark', href: '#benchmark' },
                { q: 'What does AppZetBilling already have?', a: '§02 AppZetBilling Feature Inventory', href: '#inventory' },
                { q: "What's the real gap?", a: '§03 Feature Gap Table', href: '#gaps' },
                { q: 'Can we integrate Zomato/Swiggy?', a: '§05 Delivery & Online-Ordering', href: '#delivery' },
                { q: 'What order do we build this in?', a: '§14 Development Roadmap', href: '#roadmap' },
                { q: "What's still open?", a: '§16 Vendor Questions', href: '#vendor' },
              ]}
              note={
                <>
                  Built from a live, read-only SSH inspection of the production VPS (nothing was modified) plus
                  independent research on Petpooja, delivery platforms, and payment gateways, dated in{' '}
                  <a href="#sources">§18 Sources</a>. No Petpooja integration is proposed anywhere in this report.
                </>
              }
            />
          </div>

          <section id="benchmark">
            <div className="eyebrow">01 · Petpooja Feature Benchmark <VTag kind="assumption">secondary sources — see caveat</VTag></div>
            <h2>Benchmarked, not assumed</h2>
            <p className="lede">{PETPOOJA_CAVEAT}</p>
            <Steps items={PETPOOJA_CATEGORIES} />
          </section>

          <section id="inventory">
            <div className="eyebrow">02 · AppZetBilling Feature Inventory <VTag kind="verified">verified live, 2026-09-18</VTag></div>
            <h2>More feature-complete than a from-scratch build would assume</h2>
            <p className="lede">
              Read-only SSH inspection of the production app (Laravel 10.10, PHP 8.2, MySQL, nWidart modules — stack
              detail already established on the WhatsApp Business Module page). Most of Petpooja's category A/C
              capabilities already exist in working code.
            </p>
            <Steps items={APPZET_CAPABILITIES} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">CONFIRMED ABSENT</div>
                <p>{APPZET_ABSENT_NOTE}</p>
              </div>
            </div>
          </section>

          <section id="gaps">
            <div className="eyebrow">03 · Feature Gap Table</div>
            <h2>Petpooja capability vs. AppZetBilling support vs. what's actually missing</h2>
            <p className="lede">Rows marked "None" are capabilities already verified working in §02 — no build required.</p>
            <DTable table={GAP_TABLE} />
          </section>

          <section id="architecture">
            <div className="eyebrow">04 · Recommended Integration Architecture</div>
            <h2>One pattern, reused across every external capability</h2>
            <p className="lede">
              Not bespoke code per integration or per tenant — this mirrors the existing{' '}
              <code>Modules/{'{Name}'}Addon</code> + <code>moduleCheck()</code> convention already used for{' '}
              <code>InventoryAddon</code>, <code>CashRegisterAddon</code>, etc. (§02), and the per-tenant{' '}
              <code>BusinessGateway</code> credential pattern already proven in production.
            </p>
            <Steps items={ARCH_POINTS} />
            <h3 style={{ marginTop: 26 }}>Architecture diagram</h3>
            <Mermaid chart={ARCH_DIAGRAM} height={460} />
            <h3 style={{ marginTop: 26 }}>Proposed module folder structure (new, additive)</h3>
            <div className="card pad" style={{ marginTop: 12 }}>
              <pre style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: '.82rem', whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>{FOLDER_STRUCTURE}</pre>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>{ARCH_NOTE}</p>
          </section>

          <section id="delivery">
            <div className="eyebrow">05 · Delivery-Platform &amp; Online-Ordering Feasibility</div>
            <h2>Own channel is largely built; aggregators are partner-gated</h2>
            <p className="lede">{OWN_CHANNEL_NOTE}</p>
            <h3 style={{ marginTop: 26 }}>What external aggregator integration actually requires</h3>
            <p className="lede">Verified against each platform's own developer material, not assumed.</p>
            <DTable table={DELIVERY_PLATFORMS} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag warn">
                <div className="ic">NOT OPEN APIS</div>
                <p>{DELIVERY_COMMERCIAL_NOTE}</p>
              </div>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>{DELIVERY_REMAINING_GAPS}</p>
          </section>

          <section id="whatsapp">
            <div className="eyebrow">06 · WhatsApp Integration Feasibility</div>
            <h2>Already fully designed on its own page</h2>
            <p className="lede">
              Summarized here for the Petpooja-parity lens — the full analysis lives on the dedicated WhatsApp
              Business Module page on this site and isn't re-derived.
            </p>
            <Steps items={WHATSAPP_SUMMARY} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag info">
                <div className="ic">SEE THE FULL ANALYSIS</div>
                <p>{WHATSAPP_REFERENCE_NOTE}</p>
              </div>
            </div>
          </section>

          <section id="payments">
            <div className="eyebrow">07 · Payment Integration Feasibility</div>
            <h2>Strong foundation, one real reconciliation gap</h2>
            <p className="lede">{PAYMENT_EXISTING_NOTE}</p>
            <div className="flagbar" style={{ marginTop: 12 }}>
              <div className="flag crit">
                <div className="ic">THE REAL GAP</div>
                <p>{PAYMENT_GAP_NOTE}</p>
              </div>
            </div>
            <h3 style={{ marginTop: 26 }}>Providers researched</h3>
            <Steps items={PAYMENT_PROVIDERS} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag ok">
                <div className="ic">RECOMMENDATION</div>
                <p>{PAYMENT_RECOMMENDATION}</p>
              </div>
            </div>
            <h3 style={{ marginTop: 26 }}>"Separate merchant account per tenant"</h3>
            <p style={{ marginTop: 8, maxWidth: 'none' }}>{PAYMENT_MERCHANT_NOTE}</p>
          </section>

          <section id="kitchen">
            <div className="eyebrow">08 · Inventory &amp; Kitchen-Management Roadmap</div>
            <h2>Rounding out an already-solid engine</h2>
            <p className="lede">{INVENTORY_BUILT_NOTE}</p>
            <h3 style={{ marginTop: 26 }}>Gaps, ordered by how self-contained each is</h3>
            <Steps items={INVENTORY_GAPS} />
            <p style={{ marginTop: 16, maxWidth: 'none' }}>{INVENTORY_CLOSING_NOTE}</p>
          </section>

          <section id="database">
            <div className="eyebrow">09 · Database Changes</div>
            <h2>Schema only — no migrations executed</h2>
            <p className="lede">
              Every entity follows the app's existing conventions: business_id (+ branch_id where relevant) on every
              table, integer FKs, JSON columns for flexible/credential data, the same tenant-scoping pattern already
              used across the app.
            </p>
            <DTable table={DB_ENTITIES} />
            <p style={{ marginTop: 16, maxWidth: 'none' }}>{DB_CLOSING_NOTE}</p>
          </section>

          <section id="backend">
            <div className="eyebrow">10 · Backend API Changes</div>
            <h2>Same routes/api.php convention, new endpoints</h2>
            <p className="lede">{API_CONVENTION_NOTE}</p>
            <div className="card pad" style={{ marginTop: 16 }}>
              <pre style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: '.82rem', whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>{API_ROUTES_CODE}</pre>
            </div>
            <h3 style={{ marginTop: 26 }}>New services</h3>
            <p style={{ marginTop: 8, maxWidth: 'none' }}>{API_SERVICES_NOTE}</p>
            <h3 style={{ marginTop: 26 }}>Background jobs</h3>
            <p style={{ marginTop: 8, maxWidth: 'none' }}>{API_JOBS_NOTE}</p>
            <h3 style={{ marginTop: 26 }}>Idempotency and rate limiting</h3>
            <p style={{ marginTop: 8, maxWidth: 'none' }}>{API_IDEMPOTENCY_NOTE}</p>
          </section>

          <section id="frontend">
            <div className="eyebrow">11 · Frontend &amp; Admin Dashboard Changes</div>
            <h2>Extends the existing Blade + Alpine.js admin panel</h2>
            <p className="lede">{FRONTEND_NOTE}</p>
            <Steps items={FRONTEND_TABLE} />
          </section>

          <section id="security">
            <div className="eyebrow">12 · Security &amp; Compliance</div>
            <h2>Tenant isolation, credential storage, and webhook verification</h2>
            <Steps items={SECURITY_ITEMS} />
          </section>

          <section id="monetization">
            <div className="eyebrow">13 · Subscription &amp; Monetization</div>
            <h2>Extends the existing Plan model — no new billing engine</h2>
            <p className="lede">{MONETIZATION_BASIS_NOTE}</p>
            <Steps items={MONETIZATION_TABLE} />
            <div className="flagbar" style={{ marginTop: 18 }}>
              <div className="flag warn">
                <div className="ic">ON VENDOR PRICING</div>
                <p>{PRICING_NOTE}</p>
              </div>
            </div>
            <p style={{ marginTop: 16, maxWidth: 'none' }}>{COST_CATEGORIES_NOTE}</p>
          </section>

          <section id="roadmap">
            <div className="eyebrow">14 · Development Roadmap</div>
            <h2>Five phases, ordered by dependency and risk</h2>
            {PHASES.map((p) => (
              <div className="card pad" style={{ marginTop: 16 }} key={p.n}>
                <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8 }}>Phase {p.n} — {p.t}</div>
                <table className="facts">
                  <tbody>
                    <tr><td>Features</td><td>{p.features}</td></tr>
                    <tr><td>Backend</td><td>{p.backend}</td></tr>
                    <tr><td>Frontend</td><td>{p.frontend}</td></tr>
                    <tr><td>Database</td><td>{p.database}</td></tr>
                    <tr><td>Dependencies</td><td>{p.dependencies}</td></tr>
                    <tr><td>Effort</td><td>{p.effort}</td></tr>
                    <tr><td>Risks</td><td>{p.risks}</td></tr>
                    <tr><td>Testing</td><td>{p.testing}</td></tr>
                    <tr><td>Revenue opportunity</td><td>{p.revenue}</td></tr>
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          <section id="risks">
            <div className="eyebrow">15 · Technical Risks</div>
            <h2>What could go wrong, specific to this expansion</h2>
            <Steps items={TECHNICAL_RISKS} />
          </section>

          <section id="vendor">
            <div className="eyebrow">16 · Questions Requiring Vendor Confirmation</div>
            <h2>Before committing to dates or costs</h2>
            <Steps items={VENDOR_QUESTIONS} />
          </section>

          <section id="next">
            <div className="eyebrow">17 · Recommended Next Steps</div>
            <h2>What to do now</h2>
            <Steps items={NEXT_STEPS} />
          </section>

          <section id="sources">
            <div className="eyebrow">18 · Files Inspected, Assumptions &amp; Sources</div>
            <h2>What this report is actually built on</h2>
            <h3>Files and modules inspected on the VPS</h3>
            <p style={{ marginTop: 8, maxWidth: 'none' }}>{FILES_INSPECTED_NOTE}</p>

            <h3 style={{ marginTop: 26 }}>Assumptions made explicit</h3>
            <Steps items={ASSUMPTIONS} />

            <h3 style={{ marginTop: 26 }}>Unverified claims, consolidated</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--ink-soft)', fontSize: '.9rem' }}>
              {UNVERIFIED_CLAIMS.map((c, i) => <li key={i} style={{ marginBottom: 8 }}>{c}</li>)}
            </ul>

            <h3 style={{ marginTop: 26 }}>Sources, checked 2026-09-18</h3>
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
              The WhatsApp-specific research (Meta Cloud API pricing, Embedded Signup, messaging limits) is already
              fully sourced with dates on the dedicated WhatsApp Business Module page and isn't repeated here.
            </p>
          </section>

          <footer>
            AppzetBilling vs Petpooja — Capability Gap Analysis &amp; Roadmap · compiled from a live, read-only SSH
            inspection of the production VPS and independent research on Petpooja, delivery platforms, and payment
            gateways (2026‑09‑18) · no Petpooja integration is proposed anywhere in this report · nothing on
            production was modified, restarted, or deployed to produce this analysis
          </footer>
        </main>
      </div>
    </>
  );
}
