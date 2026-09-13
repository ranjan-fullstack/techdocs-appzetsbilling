export default function FlowSummary({ files, tables, note }) {
  return (
    <div className="card pad flowsummary">
      <div className="pkline">
        FILE{files.length === 1 ? '' : 'S'}:{' '}
        {files.map((f, i) => (
          <span key={f}>
            <code className="mono">{f}</code>
            {i < files.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </div>
      <div className="fklabel" style={{ marginTop: 10 }}>
        Tables touched{tables.length > 1 ? ', roughly in order' : ''}
      </div>
      <div className="fkrow">
        {tables.map((t) => (
          <span key={t} className="fk">{t}</span>
        ))}
      </div>
      {note && <p className="tight" style={{ marginTop: 10, fontSize: '.87rem' }}>{note}</p>}
    </div>
  );
}
