import { NavLink } from 'react-router-dom';

export default function Sidebar({ toc, activeSection, meta }) {
  return (
    <aside className="side">
      <div className="brand">
        <div className="mark">AppzetBilling</div>
        <div className="sub">Technical Docs</div>
      </div>
      <nav className="site-nav">
        <NavLink to="/db-architecture" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <span className="ico">🗄</span> DB Architecture
        </NavLink>
        <NavLink to="/application-flow" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <span className="ico">🔀</span> Application Flow
        </NavLink>
        <NavLink to="/tech-stack" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <span className="ico">🧰</span> Tech Stack
        </NavLink>
        <NavLink to="/known-issues" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <span className="ico">🐞</span> Known Issues
        </NavLink>
      </nav>
      {toc && (
        <nav className="toc">
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? 'active' : undefined}>
              <span className="n">{item.num}</span> {item.label}
            </a>
          ))}
        </nav>
      )}
      <div className="meta">{meta}</div>
    </aside>
  );
}
