import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import { SEV_LABEL } from '../components/FindingsList.jsx';
import { FINDINGS } from '../data/tables.js';
import { ROADMAP, PRI_LABEL } from '../data/roadmap.js';

const TOC = [
  { id: 'critical', num: '01', label: 'Critical Bugs' },
  { id: 'other', num: '02', label: 'Other Known Issues' },
  { id: 'fixed', num: '03', label: 'Already Fixed' },
  { id: 'roadmap', num: '04', label: 'Roadmap & Recommendations' },
];

const META = (
  <>
    Derived from every finding<br />
    verified against the VPS<br />
    Hostinger VPS · Ubuntu 24.04<br />
    Investigated 2026-09-14
  </>
);

function IssueCard({ f }) {
  return (
    <div className="finding">
      <div className="num">{String(f.num).padStart(2, '0')}</div>
      <div>
        <h4>
          {f.t} <span className={`sev sev-${f.sev}`}>{SEV_LABEL[f.sev]}</span>
        </h4>
        <p>{f.d}</p>
        {f.tbls.length > 0 && (
          <div className="tblrefs">
            {f.tbls.map((x) => (
              <a key={x} href="/db-architecture#reference" title={`See ${x} in Table Reference`} style={{ textDecoration: 'none' }}>
                <code>{x}</code>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KnownIssues() {
  const [activeSection, setActiveSection] = useState('critical');

  const numbered = useMemo(() => FINDINGS.map((f, i) => ({ ...f, num: i + 1 })), []);
  const critical = useMemo(() => numbered.filter((f) => f.sev === 'crit'), [numbered]);
  const other = useMemo(() => numbered.filter((f) => f.sev === 'warn' || f.sev === 'info'), [numbered]);
  const fixed = useMemo(() => numbered.filter((f) => f.sev === 'ok'), [numbered]);

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
                <h1>AppzetBilling — Known Issues &amp; Roadmap</h1>
                <div className="desc">
                  Every bug and gap this documentation effort found while verifying the DB Architecture and Application Flow
                  docs against the live VPS, in one bug-tracker-style view — plus a prioritized list of what to fix or build
                  next. Nothing new is claimed here; every item links back to the finding it came from.
                </div>
              </div>
              <div className="badge-date">investigated 2026‑09‑14</div>
            </div>

            <div className="stats">
              <div className="stat accent"><div className="num">{critical.length}</div><div className="lbl">Critical bugs</div></div>
              <div className="stat"><div className="num">{other.length}</div><div className="lbl">Other issues</div></div>
              <div className="stat"><div className="num">{fixed.length}</div><div className="lbl">Already fixed</div></div>
              <div className="stat"><div className="num">{ROADMAP.length}</div><div className="lbl">Roadmap items</div></div>
            </div>

            <StartHereCard
              items={[
                { q: "What's actually broken right now?", a: '§01 Critical Bugs', href: '#critical' },
                { q: 'What else is worth knowing but not urgent?', a: '§02 Other Known Issues', href: '#other' },
                { q: 'What should get fixed first?', a: '§04 Roadmap — sorted Do now / Do soon / Worth planning', href: '#roadmap' },
                { q: "Want the full evidence, not just the punch-list?", a: 'DB Architecture §06 Findings', href: '/db-architecture#findings' },
              ]}
              note={
                <>
                  Every issue below is numbered exactly as it appears in{' '}
                  <a href="/db-architecture#findings">DB Architecture §06 Findings</a> — "Finding 12" here is the same
                  Finding 12 there, so cross-references from the Application Flow doc line up too.
                </>
              }
            />
          </div>

          <section id="critical">
            <div className="eyebrow">01 · Critical Bugs</div>
            <h2>{critical.length} live bugs</h2>
            <p className="lede">
              Confirmed live in production code — not theoretical, not "could happen," actually happening right now for any
              tenant that hits the affected path.
            </p>
            <div className="findlist">
              {critical.map((f) => <IssueCard key={f.num} f={f} />)}
            </div>
          </section>

          <section id="other">
            <div className="eyebrow">02 · Other Known Issues</div>
            <h2>{other.length} data-integrity gaps &amp; tech debt</h2>
            <p className="lede">
              Not actively breaking anything today, but each is a real inconsistency in the schema or the code that the
              next feature built on top of it will likely trip over.
            </p>
            <div className="findlist">
              {other.map((f) => <IssueCard key={f.num} f={f} />)}
            </div>
          </section>

          <section id="fixed">
            <div className="eyebrow">03 · Already Fixed</div>
            <h2>{fixed.length} resolved during this audit</h2>
            <p className="lede">
              Found and corrected directly on the VPS while this documentation was being verified — kept here so the fix
              doesn't get lost or re-broken later.
            </p>
            <div className="findlist">
              {fixed.map((f) => <IssueCard key={f.num} f={f} />)}
            </div>
          </section>

          <section id="roadmap">
            <div className="eyebrow">04 · Roadmap &amp; Recommendations</div>
            <h2>What to do next, in order</h2>
            <p className="lede">
              Synthesized from everything the DB Architecture and Application Flow docs verified this session — grouped by
              urgency, not by module, since that's how a team actually triages a backlog.
            </p>
            {['now', 'soon', 'later'].map((pri) => (
              <div key={pri} style={{ marginTop: pri === 'now' ? 16 : 26 }}>
                <h3>{PRI_LABEL[pri]}</h3>
                <div className="gapcard">
                  {ROADMAP.filter((r) => r.pri === pri).map((r) => (
                    <div key={r.t} className="card pad">
                      <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: 6 }}>{r.t}</div>
                      <p className="tight" style={{ fontSize: '.85rem', color: 'var(--ink-soft)', margin: 0 }}>{r.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <footer>
            AppzetBilling Known Issues &amp; Roadmap · derived from DB Architecture §06 Findings, verified 2026‑09‑13/14
          </footer>
        </main>
      </div>
    </>
  );
}
