import { Navigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { GAP_BASE, GAP_COMBINED, GAP_PARTS } from '../data/gapAnalysis.js';

const META = (
  <>
    Read-only audit of the<br />
    production VPS + Petpooja<br />
    &amp; Odisha research<br />
    Generated 2026-09-18
  </>
);

export default function GapAnalysis() {
  const { part } = useParams();
  const current = GAP_PARTS.find((p) => p.id === part);
  if (!current) return <Navigate to={`/gap-analysis/${GAP_PARTS[0].id}`} replace />;

  const src = `${GAP_BASE}parts/${current.id}.html`;

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
            <a href={GAP_COMBINED} target="_blank" rel="noreferrer">Full combined report ↗</a>
          </div>
        </div>
        <iframe key={current.id} className="gap-frame" title={current.title} src={src} />
      </main>
    </div>
  );
}
