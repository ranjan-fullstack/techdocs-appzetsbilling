import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import { STACK } from '../data/techStack.js';

const TOC = STACK.map((s, i) => ({ id: s.k, num: String(i + 1).padStart(2, '0'), label: s.title }));

const META = (
  <>
    Read from composer.json,<br />
    package.json &amp; .env<br />
    Hostinger VPS · Ubuntu 24.04<br />
    Investigated 2026-09-14
  </>
);

export default function TechStack() {
  const [activeSection, setActiveSection] = useState(STACK[0].k);
  const totalItems = useMemo(() => STACK.reduce((n, s) => n + s.items.length, 0), []);
  const paymentCount = useMemo(() => STACK.find((s) => s.k === 'payments')?.items.length ?? 0, []);

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
                <h1>AppzetBilling — Tech Stack</h1>
                <div className="desc">
                  Every framework, package, and infrastructure setting the platform actually runs on — read directly off the
                  production VPS (<code className="mono">composer.json</code>, <code className="mono">package.json</code>,{' '}
                  <code className="mono">.env</code>, and live version checks), not off a README's claims.
                </div>
              </div>
              <div className="badge-date">investigated 2026‑09‑14</div>
            </div>

            <div className="stats">
              <div className="stat accent"><div className="num">{STACK.length}</div><div className="lbl">Categories</div></div>
              <div className="stat"><div className="num">{totalItems}</div><div className="lbl">Packages / settings</div></div>
              <div className="stat"><div className="num">{paymentCount}</div><div className="lbl">Payment gateways</div></div>
              <div className="stat"><div className="num">7</div><div className="lbl">Addon modules</div></div>
            </div>

            <StartHereCard
              items={[
                { q: 'What framework/language/server does this run on?', a: '§01 Runtime & Server', href: '#runtime' },
                { q: 'Is this a SPA?', a: "§03 Frontend — no, it's server-rendered Blade + jQuery + Alpine", href: '#frontend' },
                { q: 'What payment gateways are wired up?', a: '§05 Payment Gateways', href: '#payments' },
                { q: 'Is the queue / cache / broadcast config actually used?', a: '§08 Infra Configuration', href: '#infra' },
                { q: 'What does the firewall/SSH/TLS posture look like?', a: '§09 Security & Network', href: '#security' },
                { q: 'Who actually manages this VPS day to day?', a: '§10 Hosting & Operations — CloudPanel, backups, request path', href: '#ops' },
                { q: "Want the bugs this stack has, not just its inventory?", a: 'Known Issues & Roadmap — separate page, left sidebar', href: '/known-issues' },
              ]}
              note={
                <>
                  This page is an inventory of <i>what's installed and configured</i>. For what the database looks like, see{' '}
                  <a href="/db-architecture">DB Architecture</a>; for what the code actually does with it, see{' '}
                  <a href="/application-flow">Application Flow</a>.
                </>
              }
            />
          </div>

          {STACK.map((section, i) => (
            <section id={section.k} key={section.k}>
              <div className="eyebrow">{String(i + 1).padStart(2, '0')} · {section.title}</div>
              <h2>{section.title}</h2>
              <div className="identity-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                {section.items.map((item) => (
                  <div key={item.name} className="card pad" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <div style={{ minWidth: 220, fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '.9rem' }}>
                      {item.name}
                      {item.ver && <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}> — {item.ver}</span>}
                    </div>
                    {item.note && <div style={{ color: 'var(--ink-soft)', fontSize: '.85rem', flex: 1, minWidth: 240 }}>{item.note}</div>}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <footer>
            AppzetBilling Tech Stack · read from live composer.json / package.json / .env + version checks on the VPS · 2026‑09‑14
          </footer>
        </main>
      </div>
    </>
  );
}
