import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import {
  LIVE_STATS, CURRENT_STATE, FINDINGS, CERT_FLOW, RENEW_STEPS, GOTCHAS,
  CHECKLIST, AUTOMATION_STEPS, TLS_ROADMAP, OPEN_QUESTIONS,
} from '../data/tlsCertificate.js';
import { PRI_LABEL } from '../data/roadmap.js';

const TOC = [
  { id: 'current', num: '01', label: 'Current State' },
  { id: 'findings', num: '02', label: 'What Went Wrong' },
  { id: 'flow', num: '03', label: 'How the Cert Reaches Visitors' },
  { id: 'renew', num: '04', label: 'Manual Renewal Runbook' },
  { id: 'gotchas', num: '05', label: 'Gotchas We Hit' },
  { id: 'verify', num: '06', label: 'Verification Checklist' },
  { id: 'automate', num: '07', label: 'Automating Renewal' },
  { id: 'roadmap', num: '08', label: 'Roadmap' },
  { id: 'open', num: '09', label: 'Open Questions' },
];

const META = (
  <>
    Live check of the production VPS<br />
    and the renewal performed<br />
    Renewed 2026-09-19<br />
    Next expiry 2026-12-18
  </>
);

const SEV_LABEL = { crit: 'Critical', warn: 'Warning', info: 'Info' };

function VTag({ kind, children }) {
  return <span className={`vtag ${kind}`}>{children}</span>;
}

function FindingList({ items }) {
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

function Facts({ items }) {
  return (
    <table className="facts" style={{ marginTop: 16 }}>
      <tbody>
        {items.map((f) => (
          <tr key={f.k}><td>{f.k}</td><td>{f.v}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TlsCertificate() {
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
                <h1>AppzetBilling — TLS Certificate</h1>
                <div className="desc">
                  How the wildcard certificate behind the root site and every tenant subdomain is issued, where it actually
                  lives on the server, why it silently failed to renew, and the exact steps used to renew it by hand on
                  2026-09-19. Includes the plan to automate it so this stops being a calendar reminder.
                </div>
              </div>
              <div className="badge-date">renewed 2026‑09‑19</div>
            </div>

            <div className="stats">
              {LIVE_STATS.map((m) => (
                <div className="stat accent" key={m.k}><div className="num">{m.v}</div><div className="lbl">{m.k}</div></div>
              ))}
            </div>

            <StartHereCard
              items={[
                { q: 'When does it expire and who does it cover?', a: '§01 Current State', href: '#current' },
                { q: 'Why did auto-renew not work?', a: '§02 What Went Wrong', href: '#findings' },
                { q: 'I need to renew it now — what do I do?', a: '§04 Manual Renewal Runbook', href: '#renew' },
                { q: 'How do I know it worked?', a: '§06 Verification Checklist', href: '#verify' },
                { q: 'How do we stop doing this by hand?', a: '§07 Automating Renewal', href: '#automate' },
              ]}
              note={
                <>
                  Tagged <VTag kind="verified">verified</VTag> where read directly off the live server or the live site,{' '}
                  <VTag kind="assumption">assumption</VTag> for a stated planning input, and{' '}
                  <VTag kind="review">review</VTag> for a decision the team has to make. The real server IP is masked and no
                  keys, challenge values or tokens are recorded on this page.
                </>
              }
            />
          </div>

          <section id="current">
            <div className="eyebrow">01 · Current State <VTag kind="verified">verified live, 2026-09-19</VTag></div>
            <h2>One wildcard certificate, issued by hand</h2>
            <p className="lede">
              A single certificate covers the root domain and every tenant subdomain, so its expiry is a platform-wide event,
              not a per-customer one.
            </p>
            <Facts items={CURRENT_STATE} />
          </section>

          <section id="findings">
            <div className="eyebrow">02 · What Went Wrong <VTag kind="verified">verified</VTag></div>
            <h2>The renewal machinery existed, but could not finish the job</h2>
            <p className="lede">
              Found by reading the renewal config and hooks folders on the server, and by checking that the live certificate
              was still the old one five days before expiry.
            </p>
            <FindingList items={FINDINGS} />
          </section>

          <section id="flow">
            <div className="eyebrow">03 · How the Certificate Reaches Visitors</div>
            <h2>Two copies, and only one of them is served</h2>
            <p className="lede">
              Certbot and Nginx do not share a file. The gap between them is where a renewal can succeed and still change nothing.
            </p>
            <Steps items={CERT_FLOW} />
          </section>

          <section id="renew">
            <div className="eyebrow">04 · Manual Renewal Runbook <VTag kind="verified">performed 2026-09-19</VTag></div>
            <h2>The nine steps, in order</h2>
            <p className="lede">
              This is the procedure that was actually run. Start at least two weeks before expiry — the DNS steps are the slow
              part. Until the automation in §07 exists, repeat this before every expiry.
            </p>
            <Steps items={RENEW_STEPS} />
          </section>

          <section id="gotchas">
            <div className="eyebrow">05 · Gotchas We Hit</div>
            <h2>Mistakes that cost time — so they cost less next time</h2>
            <Steps items={GOTCHAS} />
          </section>

          <section id="verify">
            <div className="eyebrow">06 · Verification Checklist</div>
            <h2>Don't trust the "success" message — check the live site</h2>
            <p className="lede">Run these from a machine that is not the server, so the answer is what visitors actually see.</p>
            <Facts items={CHECKLIST} />
          </section>

          <section id="automate">
            <div className="eyebrow">07 · Automating Renewal <VTag kind="review">planned, not built</VTag></div>
            <h2>Make the next renewal something nobody has to remember</h2>
            <p className="lede">
              DNS is hosted at Hostinger, so the challenge records can be written through its API. The design below is a plan;
              nothing here has been installed on the server yet.
            </p>
            <Steps items={AUTOMATION_STEPS} />
            <div className="flagbar" style={{ marginTop: 16 }}>
              <div className="flag ok">
                <div className="ic">PREREQUISITE</div>
                <p>
                  A Hostinger API token stored on the VPS only (root-readable, never committed to git). Without it the hooks
                  cannot create or remove the challenge records unattended.
                </p>
              </div>
            </div>
          </section>

          <section id="roadmap">
            <div className="eyebrow">08 · Roadmap</div>
            <h2>What is done, and what is next</h2>
            {['now', 'soon', 'later'].map((pri) => (
              <div key={pri} style={{ marginTop: pri === 'now' ? 16 : 26 }}>
                <h3>{PRI_LABEL[pri]}</h3>
                <div className="gapcard">
                  {TLS_ROADMAP.filter((r) => r.pri === pri).map((r) => (
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
            <div className="eyebrow">09 · Open Questions</div>
            <h2>Decisions only AppzetBilling can make</h2>
            <Steps items={OPEN_QUESTIONS} />
          </section>

          <footer>
            AppzetBilling TLS Certificate · compiled from a live check of the production VPS and the manual renewal performed
            on 2026‑09‑19 · next expiry 2026‑12‑18
          </footer>
        </main>
      </div>
    </>
  );
}
