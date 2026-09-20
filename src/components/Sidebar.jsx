import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GAP_COMBINED, GAP_PARTS } from '../data/gapAnalysis.js';
import { SP_COMBINED, SP_PARTS } from '../data/salePro.js';

const PAGES = [
  { to: '/db-architecture', ico: '🗄', label: 'DB Architecture' },
  { to: '/application-flow', ico: '🔀', label: 'Application Flow' },
  { to: '/tech-stack', ico: '🧰', label: 'Tech Stack' },
  { to: '/known-issues', ico: '🐞', label: 'Known Issues' },
  { to: '/backup-migration', ico: '🗃', label: 'Backup & Migration' },
  { to: '/deployment', ico: '🚀', label: 'Deployment & Source Mgmt' },
  { to: '/tls-certificate', ico: '🔒', label: 'TLS Certificate' },
  { to: '/whatsapp-module', ico: '💬', label: 'WhatsApp Module' },
  { to: '/petpooja-comparison', ico: '🆚', label: 'Petpooja Comparison' },
  { to: '/gap-analysis', ico: '📊', label: 'Gap Analysis' },
  { to: '/salepro-analysis', ico: '🧾', label: 'SalePro Due Diligence' },
];

export default function Sidebar({ toc, activeSection, meta }) {
  const [open, setOpen] = useState(false);
  const pathname = useLocation().pathname;
  const onGap = pathname.startsWith('/gap-analysis');
  const onSp = pathname.startsWith('/salepro-analysis');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  const navContent = (
    <>
      <div className="brand">
        <div className="mark">AppzetBilling</div>
        <div className="sub">Technical Docs</div>
      </div>
      <nav className="site-nav">
        {PAGES.map((p) => (
          <NavLink key={p.to} to={p.to} onClick={close} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="ico">{p.ico}</span> {p.label}
          </NavLink>
        ))}
      </nav>
      {onGap && (
        <nav className="site-nav gap-nav" aria-label="Gap Analysis">
          <div className="nav-label">Gap Analysis parts</div>
          {GAP_PARTS.map((p) => (
            <NavLink key={p.id} to={`/gap-analysis/${p.id}`} onClick={close} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <span className="ico num">{p.num}</span> {p.label}
            </NavLink>
          ))}
          <a href={GAP_COMBINED} target="_blank" rel="noreferrer" onClick={close}>
            <span className="ico">📄</span> Combined report ↗
          </a>
        </nav>
      )}
      {onSp && (
        <nav className="site-nav gap-nav" aria-label="SalePro Due Diligence">
          <div className="nav-label">SalePro parts</div>
          {SP_PARTS.map((p) => (
            <NavLink key={p.id} to={`/salepro-analysis/${p.id}`} onClick={close} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <span className="ico num">{p.num}</span> {p.label}
            </NavLink>
          ))}
          <a href={SP_COMBINED} target="_blank" rel="noreferrer" onClick={close}>
            <span className="ico">📄</span> Combined report ↗
          </a>
        </nav>
      )}
      {toc && (
        <nav className="toc">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={close}
              className={activeSection === item.id ? 'active' : undefined}
            >
              <span className="n">{item.num}</span> {item.label}
            </a>
          ))}
        </nav>
      )}
      <div className="meta">{meta}</div>
    </>
  );

  return (
    <>
      <div className="mobbar">
        <button
          type="button"
          className={`mobbar-toggle${open ? ' open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobbar-brand">
          <span className="mark">AppzetBilling</span>
          <span className="sub">Technical Docs</span>
        </div>
      </div>
      {toc && (
        <div className="mobtoc">
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? 'active' : undefined}>
              {item.num} {item.label}
            </a>
          ))}
        </div>
      )}
      {open && <div className="mobbar-overlay" onClick={close} />}
      <aside className={`side${open ? ' open' : ''}`}>{navContent}</aside>
    </>
  );
}
