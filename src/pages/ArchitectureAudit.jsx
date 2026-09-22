import { Navigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { AA_BASE, AA_COMBINED, AA_PARTS } from '../data/architectureAudit.js';

const META = (
  <>
    Web + mobile architecture,<br />
    API &amp; DB deep-dive plus<br />
    the target roadmap<br />
    Generated 2026-09-22
  </>
);

export default function ArchitectureAudit() {
  const { part } = useParams();
  const current = AA_PARTS.find((p) => p.id === part);
  if (!current) return <Navigate to={`/architecture-audit/${AA_PARTS[0].id}`} replace />;

  const src = `${AA_BASE}parts/${current.id}.html`;

  return (
    <div className="shell">
      <Sidebar meta={META} />
      <main className="gap-main">
        <div className="gap-bar">
          <div className="gap-title">
            <span className="gap-num">Part {current.num}</span> {current.title}
          </div>
          <div className="gap-links">
            <a href={src} target="_blank" rel="noreferrer">Open standalone ↗</a>
            <a href={AA_COMBINED} target="_blank" rel="noreferrer">Full combined report ↗</a>
          </div>
        </div>
        <iframe key={current.id} className="gap-frame" title={current.title} src={src} />
      </main>
    </div>
  );
}
