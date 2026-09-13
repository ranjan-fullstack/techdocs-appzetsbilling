const SIDE_COLOR = { 'shop-owner': 'var(--accent)', admin: 'var(--info)', system: 'var(--ink-faint)' };
const SIDE_LABEL = { 'shop-owner': 'Shop-owner app', admin: 'Superadmin app', system: 'No UI page' };

export default function AppAreaGrid({ groups, tableCounts, onSelect, onJumpToTable }) {
  return (
    <div className="modgrid">
      {groups.map((g) => {
        const names = tableCounts[g.k] || [];
        const shown = names.slice(0, 6);
        return (
          <div
            key={g.k}
            className="modcard"
            style={{ '--m': SIDE_COLOR[g.side] }}
            onClick={() => onSelect(g.k)}
          >
            <div className="top">
              <h4>{g.name}</h4>
              <span className="cnt">{names.length}</span>
            </div>
            <div className="modcard-side" style={{ color: SIDE_COLOR[g.side] }}>{SIDE_LABEL[g.side]}</div>
            <p>{g.desc}</p>
            <div className="tbls">
              {shown.map((t, i) => (
                <span key={t}>
                  <a
                    href="#reference"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onJumpToTable(t);
                    }}
                  >
                    {t}
                  </a>
                  {i < shown.length - 1 ? ' · ' : ''}
                </span>
              ))}
              {names.length > 6 ? ' …' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
