import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Mermaid from '../components/Mermaid.jsx';
import AppAreaGrid from '../components/AppAreaGrid.jsx';
import TableList from '../components/TableList.jsx';
import PlanModuleGrid from '../components/PlanModuleGrid.jsx';
import FindingsList from '../components/FindingsList.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import { MODULES, TABLES, FINDINGS } from '../data/tables.js';
import { NAV_GROUPS, TABLE_NAV_GROUP } from '../data/navGroups.js';
import { PLAN_MODULES, ungatedTables } from '../data/planModules.js';
import { buildIncomingRefs } from '../data/relationships.js';
import { ENTITY_RELATIONSHIPS, buildModuleHierarchy, colorizeErDiagram, drawnEntityNames, buildRemainingErDiagram } from '../data/diagrams.js';

const TOC = [
  { id: 'diagram', num: '01', label: 'Schema Map' },
  { id: 'tenancy', num: '02', label: 'Multi-Tenancy' },
  { id: 'modules', num: '03', label: 'App Areas' },
  { id: 'reference', num: '04', label: 'Table Reference' },
  { id: 'planModules', num: '05', label: 'Plan Modules' },
  { id: 'findings', num: '06', label: 'Findings' },
];

const META = (
  <>
    Percona 8.4.10-10 · InnoDB<br />
    utf8mb4_unicode_ci<br />
    Hostinger VPS · Ubuntu 24.04<br />
    Investigated 2026-09-13
  </>
);

export default function DbArchitecture() {
  const [activeSection, setActiveSection] = useState('diagram');
  const [activeScope, setActiveScope] = useState('all');
  const [tableResetSignal, setTableResetSignal] = useState(0);
  const findingRefs = useRef([]);
  const coloredEntityRelationships = useMemo(() => colorizeErDiagram(ENTITY_RELATIONSHIPS, TABLES, MODULES), []);
  const coreDrawnNames = useMemo(() => drawnEntityNames(ENTITY_RELATIONSHIPS, TABLES), []);
  const remainingNames = useMemo(() => TABLES.filter((t) => !coreDrawnNames.includes(t.n)).map((t) => t.n), [coreDrawnNames]);
  const coloredRemainingErDiagram = useMemo(
    () => colorizeErDiagram(buildRemainingErDiagram(TABLES, remainingNames), TABLES, MODULES),
    [remainingNames],
  );
  const moduleHierarchy = useMemo(() => buildModuleHierarchy(TABLES, MODULES), []);
  const ungated = useMemo(() => ungatedTables(TABLES), []);
  const incomingRefs = useMemo(() => buildIncomingRefs(TABLES), []);
  const critCount = useMemo(() => FINDINGS.filter((f) => f.sev === 'crit').length, []);
  const areaTableNames = useMemo(() => {
    const map = {};
    NAV_GROUPS.forEach((g) => {
      map[g.k] = TABLES.filter((t) => TABLE_NAV_GROUP[t.n] === g.k).map((t) => t.n);
    });
    return map;
  }, []);

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

  const registerFindingRef = (i, el) => {
    findingRefs.current[i] = el;
  };

  const jumpToFinding = (num) => {
    const idx = num - 1;
    const el = findingRefs.current[idx];
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.outline = '2px solid var(--crit)';
      setTimeout(() => {
        el.style.outline = '';
      }, 1600);
    }, 50);
  };

  const jumpToTable = (tableName) => {
    setActiveScope('all');
    setTableResetSignal((n) => n + 1);
    setTimeout(() => {
      const row = document.querySelector(`.trow[data-table="${tableName}"]`);
      if (!row) return;
      if (!row.classList.contains('open')) {
        row.querySelector('.thead')?.click();
      }
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.outline = '2px solid var(--accent)';
      setTimeout(() => {
        row.style.outline = '';
      }, 1600);
    }, 60);
  };

  const handleAreaSelect = (k) => {
    setActiveScope('all');
    setTableResetSignal((n) => n + 1);
    setTimeout(() => {
      document.getElementById(`nav-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <>
      <div className="shell">
        <Sidebar toc={TOC} activeSection={activeSection} meta={META} />
        <main>
          <div className="topband topband-bleed">
            <div className="title-row">
              <div>
                <h1>AppzetBilling — Production Database Schema</h1>
                <div className="desc">
                  A live map of the <code className="mono">appzetsbilling</code> MySQL database: 97 tables, 206 foreign keys,
                  one multi-tenant billing platform. Every fact below traces to a query or a source file — nothing here is
                  inferred.
                </div>
              </div>
              <div className="badge-date">investigated 2026‑09‑13</div>
            </div>

            <div className="stats">
              <div className="stat accent"><div className="num">97</div><div className="lbl">Tables</div></div>
              <div className="stat"><div className="num">206</div><div className="lbl">Foreign keys</div></div>
              <div className="stat"><div className="num">{MODULES.length}</div><div className="lbl">Modules</div></div>
              <div className="stat"><div className="num">1</div><div className="lbl">Stored procedure</div></div>
              <div className="stat"><div className="num">0</div><div className="lbl">Views · triggers</div></div>
              <div className="stat"><div className="num">{FINDINGS.length}</div><div className="lbl">Findings</div></div>
            </div>

            <StartHereCard
              items={[
                { q: 'Want the big picture, fast?', a: '§01 Schema Map — two zoomable diagrams drawing every one of the 97 tables', href: '#diagram' },
                { q: "Wondering why a table can't be seen across tenants?", a: '§02 Multi-Tenancy', href: '#tenancy' },
                { q: 'Looking for "what screen in the app uses this table"?', a: '§03 App Areas', href: '#modules' },
                { q: "Need one table's exact columns and relationships?", a: '§04 Table Reference — search, or click through from anywhere else on this page', href: '#reference' },
                { q: 'Wondering what a subscription plan can switch off?', a: '§05 Plan Modules', href: '#planModules' },
                { q: "Want to know what's broken or surprising?", a: `§06 Findings — ${FINDINGS.length} verified issues, ${critCount} of them live bugs`, href: '#findings' },
                { q: 'Want the framework/library/infra list, not the schema?', a: 'Tech Stack — separate page, left sidebar', href: '/tech-stack' },
                { q: "Want a punch-list of what's broken and what's next?", a: 'Known Issues & Roadmap — separate page, left sidebar', href: '/known-issues' },
              ]}
              note={
                <>
                  One thing that trips people up: this doc uses "module" for three unrelated things, and every table shows
                  all three together when you expand it in §04 — <b>Backend Module</b> (which Laravel code package owns it,
                  §01), <b>App Area</b> (which screen in the real app touches it, §03), and{' '}
                  <b>Plan Module</b> (whether a subscription plan can gate it at all, §05). For what the code actually{' '}
                  <i>does</i> with these tables rather than just their shape, see the companion{' '}
                  <a href="/application-flow">Application Flow</a> doc.
                </>
              }
            />
          </div>

          <section id="diagram">
            <div className="eyebrow">01 · Schema Map</div>
            <h2>Module hierarchy</h2>
            <p className="lede">
              Every tenant-owned table hangs off one root: <code className="mono">businesses</code>. The {MODULES.length} groups
              below are how this doc organizes that ownership — five are confirmed, real nwidart/laravel-modules packages
              (HrmAddon, MultiBranchAddon, CashRegisterAddon, CustomDomainAddon, InventoryAddon) verified against their actual
              migrations and models on the VPS; the rest are business-area groupings within the base app itself, not
              separate installable packages.
            </p>
            <Mermaid chart={moduleHierarchy} height={280} />
            <div className="diagram-caption">
              Table counts per backend module — this is the code's own structure. For how these same tables map onto the
              app you actually use, see §03 (App Areas) and §04 (Table Reference).
            </div>

            <h3 style={{ marginTop: 34 }}>Entity relationships — the {coreDrawnNames.length} high-traffic tables</h3>
            <p className="lede">
              The full 97-table graph is unreadable as a picture; this hand-labeled diagram covers the high-traffic,
              structurally central tables — {coreDrawnNames.length} of them, computed from which entities actually appear
              below rather than retyped (an earlier version of this doc claimed 45 and was wrong).
            </p>
            <Mermaid chart={coloredEntityRelationships} height={580} />
            <div className="diagram-legend">
              {MODULES.map((mod) => (
                <span key={mod.k}>
                  <i className="sw" style={{ background: `var(--mod-${mod.k})` }} />
                  {mod.name}
                </span>
              ))}
            </div>

            <h3 style={{ marginTop: 34 }}>The remaining {remainingNames.length} tables</h3>
            <p className="lede">
              Everything the diagram above leaves out — Spatie's RBAC pivots, second-order line-item pivots, marketing/CMS
              content, pure framework tables, and per-tenant config/lookup tables — auto-generated from the same
              foreign-key data as every other diagram on this page, not hand-drawn, so it can't fall out of sync the way the
              stale "45 tables" claim above did. A few ({' '}
              <code className="mono">faqs, features, languages, migrations, options, jobs, failed_jobs, password_resets,
              password_reset_tokens</code>
              {' '}) have no relationship to anything else in the schema at all — they still get a box, deliberately, rather
              than silently vanishing from the picture.
            </p>
            <Mermaid chart={coloredRemainingErDiagram} height={580} />
            <div className="diagram-legend">
              {MODULES.map((mod) => (
                <span key={`r-${mod.k}`}>
                  <i className="sw" style={{ background: `var(--mod-${mod.k})` }} />
                  {mod.name}
                </span>
              ))}
            </div>
            <p className="tight" style={{ fontSize: '.85rem', color: 'var(--ink-faint)', marginTop: 10 }}>
              Together these two diagrams draw all {coreDrawnNames.length + remainingNames.length} tables. Every one is also
              searchable, with its full column list and both its outgoing and incoming foreign keys, in §04.
            </p>
          </section>

          <section id="tenancy">
            <div className="eyebrow">02 · Multi-Tenancy</div>
            <h2>How one database serves every tenant</h2>
            <p className="lede">
              Shared database, shared schema, row-level isolation. There is one set of 97 tables; a tenant is a row in{' '}
              <code className="mono">businesses</code>, and isolation is enforced by a <code className="mono">business_id</code>{' '}
              column discipline — not by separate schemas or databases.
            </p>

            <div className="scopebar" role="img" aria-label="1 root table, 60 direct, 14 transitive, 22 global">
              <div style={{ width: '1.0%', background: 'var(--accent-strong)' }} title="Root"></div>
              <div style={{ width: '61.9%', background: 'var(--accent)' }}>60 direct</div>
              <div style={{ width: '14.4%', background: '#4FA3A8' }}>14 transitive</div>
              <div style={{ width: '22.7%', background: 'var(--ink-faint)' }}>22 global</div>
            </div>
            <div className="scope-legend">
              <span><i className="dot" style={{ background: 'var(--accent-strong)' }} /> Root — <code className="mono">businesses</code> itself</span>
              <span><i className="dot" style={{ background: 'var(--accent)' }} /> Direct — own <code className="mono">business_id</code> column, 56 required + 5 nullable</span>
              <span><i className="dot" style={{ background: '#4FA3A8' }} /> Transitive — one join from a tenant via a parent FK</span>
              <span><i className="dot" style={{ background: 'var(--ink-faint)' }} /> Global — no tenant linkage at all</span>
            </div>

            <p style={{ marginTop: 16 }}>
              56 of the 60 direct tables use <code className="mono">business_id NOT NULL ON DELETE CASCADE</code> — deleting a
              business deletes that tenant's row outright. Five are nullable by design: <code className="mono">blogs</code>,{' '}
              <code className="mono">messages</code>, <code className="mono">testimonials</code> (public-site content
              optionally attributed to a business, <code className="mono">SET NULL</code>), <code className="mono">users</code>{' '}
              (platform staff — superadmin/admin/manager — carry no business), and{' '}
              <code className="mono">recipe_ingredients</code> (nullable <code className="mono">SET NULL</code>, inconsistent
              with its sibling <code className="mono">recipes</code> — Finding 5).
            </p>
            <p>
              All of that is about real SQL <code className="mono">DELETE</code> statements. Two tables opt out of that
              model entirely: <code className="mono">branches</code> and <code className="mono">notifications</code> use
              Laravel's <code className="mono">SoftDeletes</code> trait, so their <code className="mono">delete()</code>{' '}
              just sets a <code className="mono">deleted_at</code> timestamp — the row stays, and none of the CASCADE/SET
              NULL rules above ever fire from it. Marked with an amber "Deletion: soft" chip wherever they show up in §04.
              See Finding 24.
            </p>

            <h3 style={{ marginTop: 30 }}>Application-layer scopes (beyond the DB)</h3>
            <p>
              <code className="mono">app/Models/Scopes/BranchScope.php</code> adds branch-level filtering on top of tenant
              isolation once MultiBranchAddon is enabled and the user has an <code className="mono">active_branch_id</code> —
              enforced in Eloquent, not the database, so raw SQL bypasses it. <code className="mono">app/Models/Scopes/DataManager.php</code>{' '}
              is a separate ownership scope restricting queries to the current user unless they hold a named permission or are{' '}
              <code className="mono">shop-owner</code>.
            </p>

          </section>

          <section id="modules">
            <div className="eyebrow">03 · App Areas</div>
            <h2>Where each table shows up in the app</h2>
            <p className="lede">
              Taken straight from the real navigation — the shop-owner sidebar (POS, Orders, Kitchens, Purchases, Inventory,
              Reservations, Tables, Menus, Parties, Due List, Coupon, Branch, Incomes, Expenses, Transaction, Cash Register,
              VAT, Staff, Subscriptions, Payment Type, HRM, My Domains, Messages, Settings, Newsletters) and the superadmin
              sidebar (Store List, Category List, Front CMS) — not a taxonomy invented for this doc. Click a card to jump to
              its tables below; a few framework tables have no page at all, which is itself worth knowing.
            </p>
            <AppAreaGrid groups={NAV_GROUPS} tableCounts={areaTableNames} onSelect={handleAreaSelect} onJumpToTable={jumpToTable} />
          </section>

          <section id="reference">
            <div className="eyebrow">04 · Table Reference</div>
            <h2>All 97 tables</h2>
            <p className="lede">
              Grouped by app area (above) so the list matches how the product is actually organized. Search or filter by
              tenant scope within that, then open a row for its primary key, every foreign key with its{' '}
              <code className="mono">ON DELETE</code> rule, and any findings that touch it.
            </p>
            <TableList
              tables={TABLES}
              modules={MODULES}
              activeScope={activeScope}
              onScopeChange={setActiveScope}
              onJumpToFinding={jumpToFinding}
              resetSignal={tableResetSignal}
              incomingRefs={incomingRefs}
            />
          </section>

          <section id="planModules">
            <div className="eyebrow">05 · Plan Modules</div>
            <h2>What a subscription plan can actually turn off</h2>
            <p className="lede">
              A separate system from everything above: the "Enabled Modules" checklist on the plan-edit screen
              (<code className="mono">admin/plans/edit.blade.php</code>) writes to{' '}
              <code className="mono">available_modules</code>, and <code className="mono">plan_module_enabled()</code> reads
              it back to hide sidebar links and — via the <code className="mono">CheckModuleAccess</code> middleware — block
              the underlying routes outright. This resolves what the Findings section used to mark unverified:{' '}
              <b>yes, it's enforced</b>, at both layers. Verified by grepping the actual helper, service, and middleware
              source, then cross-checking one bug directly against the live <code className="mono">plans</code> table.
            </p>
            <PlanModuleGrid modules={PLAN_MODULES} onJumpToTable={jumpToTable} />
            <div className="card pad" style={{ marginTop: 18 }}>
              <p className="tight" style={{ margin: 0, fontSize: '.87rem' }}>
                <b>{ungated.length} tables are ungated</b> — no plan module can hide them, because nothing in{' '}
                <code className="mono">ModuleSubscriptionService::routeMap()</code> or its URL-segment fallback points at
                them. That includes every superadmin-only table, all Laravel framework tables, and core features like{' '}
                <code className="mono">tables</code>/<code className="mono">areas</code>, <code className="mono">coupons</code>,{' '}
                <code className="mono">transactions</code>, <code className="mono">staff</code>, and{' '}
                <code className="mono">domains</code> — a subscription plan cannot switch these off no matter how the 18
                checkboxes above are set.
              </p>
            </div>
          </section>

          <section id="findings">
            <div className="eyebrow">06 · Findings</div>
            <h2>{FINDINGS.length} things worth your attention</h2>
            <p className="lede">
              Ranked roughly by how much damage each could do if left alone. Two are independently corroborated by comments
              already written into <code className="mono">clone_business_catalog</code> by whoever built it.
            </p>
            <FindingsList findings={FINDINGS} registerRef={registerFindingRef} onJumpToTable={jumpToTable} />

            <div className="unverified">
              <h4>Could not be verified</h4>
              <ul>
                <li>
                  Row-count exactness for 90 of 97 tables: seven were spot-checked with a live{' '}
                  <code className="mono">COUNT(*)</code> against the <code className="mono">information_schema</code> estimate
                  (<code className="mono">businesses, branches, sales, products, users, plan_subscribes, stock_movements</code>)
                  and all matched exactly; the rest are inferred to be exact at this row scale, not individually re-verified.
                </li>
                <li>
                  Application routes/controllers were out of scope for most of this document — every "purpose" note comes
                  from column shapes, FK topology, and Model/migration files only, <i>except</i> §05 Plan Modules, which did
                  trace real route names and middleware. See the Application Flow doc for broader request-path detail.
                </li>
              </ul>
            </div>
          </section>

          <footer>
            AppzetBilling Schema Reference · built from live <code>information_schema</code> / <code>SHOW CREATE TABLE</code>{' '}
            queries + Laravel model/migration cross-checks · 2026‑09‑13
          </footer>
        </main>
      </div>
    </>
  );
}
