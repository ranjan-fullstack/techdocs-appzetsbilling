import { Navigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { SP_BASE, SP_COMBINED, SP_PARTS } from '../data/salePro.js';

const META = (
  <>
    Due diligence on SalePro +<br />
    SalePro SaaS (CodeCanyon)<br />
    Research only, nothing bought<br />
    Generated 2026-09-20
  </>
);

export default function SaleProAnalysis() {
  const { part } = useParams();
  const current = SP_PARTS.find((p) => p.id === part);
  if (!current) return <Navigate to={`/salepro-analysis/${SP_PARTS[0].id}`} replace />;

  const src = `${SP_BASE}parts/${current.id}.html`;

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
            <a href={SP_COMBINED} target="_blank" rel="noreferrer">Full combined report ↗</a>
          </div>
        </div>
        <iframe key={current.id} className="gap-frame" title={current.title} src={src} />
      </main>
    </div>
  );
}
