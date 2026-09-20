import Sidebar from '../components/Sidebar.jsx';

// Generated from ../printer-analysis (src body + build.mjs) into public/reports/printer-analysis/.
const SRC = `${import.meta.env.BASE_URL}reports/printer-analysis/printer-analysis.html`;

const META = (
  <>
    Plan-wise printers, web vs<br />
    Flutter app, KOT<br />
    Read-only research<br />
    Generated 2026-09-20
  </>
);

export default function PrinterAnalysis() {
  return (
    <div className="shell">
      <Sidebar meta={META} />
      <main className="gap-main">
        <div className="gap-bar">
          <div className="gap-title">Printer Analysis</div>
          <div className="gap-links">
            <a href={SRC} target="_blank" rel="noreferrer">Open standalone ↗</a>
          </div>
        </div>
        <iframe className="gap-frame" title="Printer Analysis" src={SRC} />
      </main>
    </div>
  );
}
