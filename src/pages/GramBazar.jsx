import Sidebar from '../components/Sidebar.jsx';

// The GramBazar clickable prototype (buyer app, seller app and admin console, sample data only).
// Static copy of one self-contained page in public/reports/grambazar/index.html.
const SRC = `${import.meta.env.BASE_URL}reports/grambazar/index.html`;

const META = (
  <>
    Clickable prototype<br />
    Buyer app, seller app, admin<br />
    Sample data only, nothing is real<br />
    Copied from the GramBazar artifact
  </>
);

export default function GramBazar() {
  return (
    <div className="shell">
      <Sidebar meta={META} />
      <main className="gap-main">
        <div className="gap-bar">
          <div className="gap-title">GramBazar Prototype</div>
          <div className="gap-links">
            <a href={SRC} target="_blank" rel="noreferrer">Open standalone ↗</a>
          </div>
        </div>
        <iframe className="gap-frame" title="GramBazar Prototype" src={SRC} />
      </main>
    </div>
  );
}
