const KEY_LABEL = { PRI: 'PK', UNI: 'UNIQUE', MUL: 'INDEX' };
const KEY_CLASS = { PRI: 'pk', UNI: 'uni', MUL: 'idx' };

export default function ColumnList({ columns }) {
  if (!columns || columns.length === 0) return null;

  return (
    <div className="collist">
      <div className="colrow colrow-head">
        <span>Column</span>
        <span>Type</span>
        <span className="col-null">Null</span>
        <span>Key</span>
        <span className="col-extra">Extra</span>
      </div>
      {columns.map(([name, type, nullable, key, extra]) => {
        const isSoftDelete = name === 'deleted_at';
        return (
          <div className={`colrow${isSoftDelete ? ' soft-delete-row' : ''}`} key={name}>
            <span className="colname">{name}</span>
            <span className="coltype">{type}</span>
            <span className={`col-null colflag${nullable ? ' null-yes' : ' null-no'}`}>{nullable ? 'YES' : '—'}</span>
            <span>
              {isSoftDelete ? (
                <span className="colflag soft" title="This table uses Laravel soft-deletes — a delete() sets this instead of removing the row">SOFT DELETE</span>
              ) : key ? (
                <span className={`colflag ${KEY_CLASS[key] || ''}`}>{KEY_LABEL[key] || key}</span>
              ) : null}
            </span>
            <span className="col-extra colextra">{extra || ''}</span>
          </div>
        );
      })}
    </div>
  );
}
