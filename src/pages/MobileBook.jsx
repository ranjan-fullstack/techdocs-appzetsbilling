import Sidebar from '../components/Sidebar.jsx';

// The AppZet Mobile Book (the Android app: feature cards and detail sheets, with release state per feature).
// Static copy in public/reports/mobile-book/: index.html plus data-m1..m3.js (cards in m1 and m2, detail sheets in m3).
const SRC = `${import.meta.env.BASE_URL}reports/mobile-book/index.html`;

const META = (
  <>
    Android app feature cards<br />
    Release state per feature<br />
    Odia text for shop owners<br />
    Copied from the Mobile Book artifact
  </>
);

export default function MobileBook() {
  return (
    <div className="shell">
      <Sidebar meta={META} />
      <main className="gap-main">
        <div className="gap-bar">
          <div className="gap-title">Mobile Book</div>
          <div className="gap-links">
            <a href={SRC} target="_blank" rel="noreferrer">Open standalone ↗</a>
          </div>
        </div>
        <iframe className="gap-frame" title="Mobile Book" src={SRC} />
      </main>
    </div>
  );
}
