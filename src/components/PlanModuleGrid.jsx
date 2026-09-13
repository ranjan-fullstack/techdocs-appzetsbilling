export default function PlanModuleGrid({ modules, onJumpToTable }) {
  return (
    <div className="modgrid">
      {modules.map((m) => (
        <div key={m.key} className={`modcard plancard${m.bug ? ' has-bug' : ''}`} style={{ cursor: 'default' }}>
          <div className="top">
            <h4>{m.label}</h4>
            <span className="cnt">{m.tables.length}</span>
          </div>
          <div className="plancard-key">
            available_modules[<code>{m.key}</code>]
            {m.addon && <span className="plancard-addon"> · requires {m.addon}</span>}
          </div>
          {m.tables.length > 0 ? (
            <div className="tbls">
              {m.tables.map((t, i) => (
                <span key={t}>
                  <a
                    href="#reference"
                    onClick={(e) => {
                      e.preventDefault();
                      onJumpToTable(t);
                    }}
                  >
                    {t}
                  </a>
                  {i < m.tables.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </div>
          ) : (
            <div className="tbls">no dedicated tables</div>
          )}
          {m.note && <p className="plancard-note">{m.note}</p>}
          {m.bug && <p className="plancard-bug">{m.bug}</p>}
        </div>
      ))}
    </div>
  );
}
