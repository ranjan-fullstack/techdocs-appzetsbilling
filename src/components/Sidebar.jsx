import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const PAGES = [
  { to: '/db-architecture', ico: '🗄', label: 'DB Architecture' },
  { to: '/application-flow', ico: '🔀', label: 'Application Flow' },
  { to: '/tech-stack', ico: '🧰', label: 'Tech Stack' },
  { to: '/known-issues', ico: '🐞', label: 'Known Issues' },
  { to: '/backup-migration', ico: '🗃', label: 'Backup & Migration' },
  { to: '/deployment', ico: '🚀', label: 'Deployment & Source Mgmt' },
  { to: '/whatsapp-module', ico: '💬', label: 'WhatsApp Module' },
];

export default function Sidebar({ toc, activeSection, meta }) {
  const [open, setOpen] = useState(false);

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
