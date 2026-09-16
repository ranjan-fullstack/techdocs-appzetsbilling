import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import {
  LIVE_STATS, CURRENT_STATE, RISKS, OPTIONS_TABLE, CLOUDPANEL_FACTS,
  GIT_WORKFLOW_STEPS, CI_STEPS, DEPLOY_STEPS, STAGING_STEPS,
  DEPLOYMENT_ROADMAP, OPEN_QUESTIONS,
} from '../data/deployment.js';
import { PRI_LABEL } from '../data/roadmap.js';

const TOC = [
  { id: 'current', num: '01', label: 'Current State' },
  { id: 'risks', num: '02', label: 'Risks Today' },
  { id: 'options', num: '03', label: 'Deployment Architecture Options' },
  { id: 'cloudpanel', num: '04', label: 'What CloudPanel Supports' },
  { id: 'workflow', num: '05', label: 'Recommended Git Workflow' },
  { id: 'ci', num: '06', label: 'CI Pipeline Design' },
  { id: 'deploy', num: '07', label: 'Deploy Script & Atomic Rollback' },
  { id: 'staging', num: '08', label: 'Staging Environment' },
  { id: 'roadmap', num: '09', label: 'Implementation Roadmap' },
  { id: 'open', num: '10', label: 'Open Questions' },
];

const META = (
  <>
    Live check of the production VPS<br />
    git state, CloudPanel/clpctl,<br />
    CI &amp; test config<br />
    Investigated 2026-09-17
  </>
);

const SEV_LABEL = { crit: 'Critical', warn: 'Warning', info: 'Info' };

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
            <h4>{f.t} <span className={`sev sev-${f.sev}`}>{SEV_LABEL[f.sev]}</span></h4>
            <p>{f.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Steps({ items }) {
  return (
    <div className="steps">
      {items.map((it, i) => (
        <div className="step" data-n={i + 1} key={i}>
          <h4>{it.t}</h4>
          <p>{it.d}</p>
        </div>
      ))}
    </div>
  );
}

export default function Deployment() {
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
                <h1>AppzetBilling — Deployment &amp; Source Management</h1>
                <div className="desc">
                  A live check of how code actually reaches production today — git state, CloudPanel's real capabilities,
                  CI and test configuration — followed by a deployment and source-control plan sized for the current
                  scale (one VPS, 38 tenants, 1.4% CPU). No production data was changed; the git status/log commands below
                  are read-only.
                </div>
              </div>
              <div className="badge-date">audited 2026‑09‑17</div>
            </div>

            <div className="stats">
              {LIVE_STATS.map((m) => (
                <div className="stat accent" key={m.k}><div className="num">{m.v}</div><div className="lbl">{m.k}</div></div>
              ))}
            </div>

            <StartHereCard
              items={[
                { q: "What's actually wrong right now?", a: '§02 Risks Today', href: '#risks' },
                { q: 'What should we actually do?', a: '§03 Deployment Architecture Options', href: '#options' },
                { q: 'How do we stop editing production directly?', a: '§05 Recommended Git Workflow', href: '#workflow' },
                { q: 'How does staging work without a second server?', a: '§08 Staging Environment', href: '#staging' },
                { q: 'What order do we build this in?', a: '§09 Implementation Roadmap', href: '#roadmap' },
              ]}
              note={
                <>
                  Every figure below is tagged <VTag kind="verified">verified</VTag> (read directly off the live server),{' '}
                  <VTag kind="assumption">assumption</VTag> (a stated planning input), or{' '}
                  <VTag kind="review">review</VTag> (a decision AppzetBilling has to make, not a technical fact).
                </>
              }
            />
          </div>

          <section id="current">
            <div className="eyebrow">01 · Current State <VTag kind="verified">verified live, 2026-09-17</VTag></div>
            <h2>How code actually reaches production today</h2>
            <p className="lede">
              Checked directly on the VPS — not assumed from the app's documentation, since the two turned out to disagree
              in an important way (§02).
            </p>
            <table className="facts" style={{ marginTop: 16 }}>
              <tbody>
                {CURRENT_STATE.map((f) => (
                  <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="risks">
            <div className="eyebrow">02 · Risks Today</div>
            <h2>What's actually wrong, not theoretical</h2>
            <p className="lede">Found by checking real git history and the live working tree on production — not a generic checklist.</p>
            <RiskList items={RISKS} />
          </section>

          <section id="options">
            <div className="eyebrow">03 · Deployment Architecture Options</div>
            <h2>Four approaches, evaluated against actual scale</h2>
            <p className="lede">Same principle as the Backup &amp; Migration audit: sized for what's actually running, not a generic template.</p>
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
            <div className="flagbar" style={{ marginTop: 16 }}>
              <div className="flag ok">
                <div className="ic">RECOMMENDATION</div>
                <p>
                  Option C — full CI/CD with atomic releases. Option B alone still leaves deploys manual and rollback slow;
                  Option D solves a scaling problem AppzetBilling doesn't have yet at 38 tenants and 1.4% CPU.
                </p>
              </div>
            </div>
          </section>

          <section id="cloudpanel">
            <div className="eyebrow">04 · What CloudPanel Actually Supports <VTag kind="verified">verified via clpctl</VTag></div>
            <h2>The panel handles hosting, not deployment</h2>
            <p className="lede">Checked directly against the installed clpctl CLI rather than assumed from CloudPanel's general feature list.</p>
            <table className="facts" style={{ marginTop: 16 }}>
              <tbody>
                {CLOUDPANEL_FACTS.map((f) => (
                  <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="workflow">
            <div className="eyebrow">05 · Recommended Git Workflow</div>
            <h2>Making "never commit from the server" the default, not a rule to remember</h2>
            <Steps items={GIT_WORKFLOW_STEPS} />
          </section>

          <section id="ci">
            <div className="eyebrow">06 · CI Pipeline Design</div>
            <h2>Catch it before merge, not after deploy</h2>
            <Steps items={CI_STEPS} />
          </section>

          <section id="deploy">
            <div className="eyebrow">07 · Deploy Script &amp; Atomic Rollback</div>
            <h2>From "git pull and hope" to instant rollback</h2>
            <Steps items={DEPLOY_STEPS} />
          </section>

          <section id="staging">
            <div className="eyebrow">08 · Staging Environment</div>
            <h2>Free, on the same box — the VPS has the headroom</h2>
            <Steps items={STAGING_STEPS} />
          </section>

          <section id="roadmap">
            <div className="eyebrow">09 · Implementation Roadmap</div>
            <h2>Ordered by dependency and risk, not just priority</h2>
            <p className="lede">Plan only — nothing in this section has been built yet.</p>
            {['now', 'soon', 'later'].map((pri) => (
              <div key={pri} style={{ marginTop: pri === 'now' ? 16 : 26 }}>
                <h3>{PRI_LABEL[pri]}</h3>
                <div className="gapcard">
                  {DEPLOYMENT_ROADMAP.filter((r) => r.pri === pri).map((r) => (
                    <div key={r.t} className="card pad">
                      <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: 6 }}>{r.t}</div>
                      <p className="tight" style={{ fontSize: '.85rem', color: 'var(--ink-soft)', margin: 0 }}>{r.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section id="open">
            <div className="eyebrow">10 · Open Questions</div>
            <h2>Decisions only AppzetBilling can make</h2>
            <p className="lede">Nothing in this document has been acted on.</p>
            <Steps items={OPEN_QUESTIONS} />
          </section>

          <footer>
            AppzetBilling Deployment &amp; Source Management · compiled from a live check of the production VPS's git state,
            CloudPanel/clpctl capabilities, and CI/test configuration (2026‑09‑17) · no production data or configuration
            was changed while producing this audit
          </footer>
        </main>
      </div>
    </>
  );
}
