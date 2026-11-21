import Sidebar from '../components/Sidebar.jsx';

// The AppZet Feature Book (feature cards, detail sheets, sell kits). Static copy in public/reports/feature-book/:
// index.html plus data-a..g.js (the cards live in data-a and data-b, benefits in data-c and data-d, detail sheets in data-e and data-f, packages in data-g).
const SRC = `${import.meta.env.BASE_URL}reports/feature-book/index.html`;

const META = (
  <>
    Feature cards for every module<br />
    Detail sheets and sell kits<br />
    Odia text for shop owners<br />
    Copied from the Feature Book artifact
  </>
);

export default function FeatureBook() {
  return (
    <div className="shell">
      <Sidebar meta={META} />
      <main className="gap-main">
        <div className="gap-bar">
          <div className="gap-title">Feature Book</div>
          <div className="gap-links">
            <a href={SRC} target="_blank" rel="noreferrer">Open standalone ↗</a>
          </div>
        </div>
        <iframe className="gap-frame" title="Feature Book" src={SRC} />
      </main>
    </div>
  );
}
