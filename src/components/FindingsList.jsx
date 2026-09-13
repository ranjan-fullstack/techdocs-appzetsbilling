export const SEV_LABEL = { ok: 'Fixed', crit: 'Bug / Risk', warn: 'Data integrity', info: 'Tech debt' };

export default function FindingsList({ findings, registerRef, onJumpToTable }) {
  return (
    <div className="findlist">
      {findings.map((f, i) => (
        <div key={i} className="finding" ref={(el) => registerRef(i, el)}>
          <div className="num">{String(i + 1).padStart(2, '0')}</div>
          <div>
            <h4>
              {f.t} <span className={`sev sev-${f.sev}`}>{SEV_LABEL[f.sev]}</span>
            </h4>
            <p>{f.d}</p>
            {f.tbls.length > 0 && (
              <div className="tblrefs">
                {f.tbls.map((x) => (
                  <code
                    key={x}
                    role="button"
                    tabIndex={0}
                    title={`Jump to ${x}`}
                    onClick={() => onJumpToTable(x)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onJumpToTable(x);
                      }
                    }}
                  >
                    {x}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
