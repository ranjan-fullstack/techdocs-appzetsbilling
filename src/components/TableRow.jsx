import { useState } from 'react';
import ColumnList from './ColumnList.jsx';
import { COLUMNS, softDeleteTables } from '../data/columns.js';
import { NAV_GROUPS, TABLE_NAV_GROUP } from '../data/navGroups.js';
import { PLAN_MODULES, tablePlanModuleMap } from '../data/planModules.js';

const RULE = { C: 'CASCADE', SN: 'SET NULL', NA: 'NO ACTION' };
const scopeColor = { root: 'var(--accent-strong)', direct: 'var(--accent)', transitive: '#4FA3A8', global: 'var(--ink-faint)' };
const scopeLabel = { root: 'root', direct: 'direct', transitive: 'transitive', global: 'global' };
const SIDE_LABEL = { 'shop-owner': 'shop-owner app', admin: 'superadmin app', system: 'no UI page' };

// Built once at module load, not per-row per-render — both are small static lookups.
const NAV_GROUP_BY_KEY = Object.fromEntries(NAV_GROUPS.map((g) => [g.k, g]));
const TABLE_PLAN_MODULE = tablePlanModuleMap(PLAN_MODULES);
const SOFT_DELETE_TABLES = new Set(softDeleteTables());

export default function TableRow({ table, moduleName, hidden, onJumpToFinding, incomingRefs }) {
  const [open, setOpen] = useState(false);
  const fks = table.fks || [];
  const weakfk = table.weakfk || [];
  const flags = table.flags || [];
  const columns = COLUMNS[table.n];
  const refs = incomingRefs || [];
  const area = NAV_GROUP_BY_KEY[TABLE_NAV_GROUP[table.n]];
  const planModule = TABLE_PLAN_MODULE[table.n];
  const softDelete = SOFT_DELETE_TABLES.has(table.n);

  return (
    <div className={`trow${open ? ' open' : ''}${hidden ? ' hidden-row' : ''}`} data-table={table.n}>
      <div className="thead" onClick={() => setOpen((o) => !o)}>
        <div className="tname">{table.n}</div>
        <div className="badge-mod tpk-col">
          <i className="dot" style={{ background: `var(--mod-${table.m})` }} />
          {moduleName}
        </div>
        <div className="trows">{table.rows.toLocaleString()} rows</div>
        <div className="tscope fkcount-col" style={{ color: scopeColor[table.scope] }}>
          {scopeLabel[table.scope]}{table.nullableBiz ? ' · nullable' : ''}
        </div>
        <div className="tscope" style={{ color: 'var(--ink-faint)' }}>
          {fks.length} FK{fks.length === 1 ? '' : 's'}
        </div>
        <div className="chev">›</div>
      </div>
      <div className="tdetail">
        <p className="purpose">{table.note}</p>
        <div className="identity-row">
          <span className="identity-chip">
            <span className="identity-k">App Area</span> {area?.name ?? '—'}
            {area && <span className="identity-side"> ({SIDE_LABEL[area.side]})</span>}
          </span>
          <span className="identity-chip">
            <span className="identity-k">Backend Module</span> {moduleName}
          </span>
          <span className={`identity-chip${planModule ? '' : ' ungated'}`}>
            <span className="identity-k">Plan Module</span>{' '}
            {planModule ? <>available_modules[{planModule.key}]</> : 'not gated by any plan'}
          </span>
          {softDelete && (
            <span className="identity-chip soft-delete">
              <span className="identity-k">Deletion</span> soft — rows stay, <code className="mono">deleted_at</code> just
              gets set
            </span>
          )}
        </div>
        {columns ? (
          <>
            <div className="fklabel">Columns ({columns.length})</div>
            <ColumnList columns={columns} />
          </>
        ) : (
          <div className="pkline">PRIMARY KEY: {table.pk}</div>
        )}
        {(fks.length > 0 || weakfk.length > 0) && (
          <>
            <div className="fklabel">Foreign keys</div>
            <div className="fkrow">
              {fks.map((f, i) => {
                const ruleClass = f.bad ? '' : f.d === 'C' ? 'rule-CASCADE' : f.d === 'SN' ? 'rule-SETNULL' : 'rule-NOACTION';
                const ruleText = f.bad ? 'BUG' : RULE[f.d];
                return (
                  <span key={i} className={`fk${f.bad ? ' bad' : ''}`}>
                    {f.c} → {f.r}
                    <span className={`rule ${ruleClass}`}>{ruleText}</span>
                  </span>
                );
              })}
              {weakfk.map((w, i) => (
                <span key={i} className="fk weak">
                  {w.c} ⇢ {w.r}
                  <span className="rule" style={{ background: 'transparent', color: 'var(--ink-faint)' }}>no FK</span>
                </span>
              ))}
            </div>
          </>
        )}
        <div className="fklabel">Referenced by ({refs.length})</div>
        {refs.length > 0 ? (
          <div className="fkrow">
            {refs.map((r, i) => {
              const ruleClass = r.weak ? '' : r.bad ? '' : r.rule === 'C' ? 'rule-CASCADE' : r.rule === 'SN' ? 'rule-SETNULL' : 'rule-NOACTION';
              const ruleText = r.weak ? 'no FK' : r.bad ? 'BUG' : RULE[r.rule];
              return (
                <span key={i} className={`fk${r.bad ? ' bad' : ''}${r.weak ? ' weak' : ''}`}>
                  ← {r.from}.{r.column}
                  <span className={`rule ${ruleClass}`} style={r.weak ? { background: 'transparent', color: 'var(--ink-faint)' } : undefined}>
                    {ruleText}
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="tight" style={{ fontSize: '.82rem', color: 'var(--ink-faint)', margin: 0 }}>
            Nothing else in the schema references this table.
          </p>
        )}
        {flags.length > 0 && (
          <div className="flaglinks">
            {flags.map((f) => (
              <a
                key={f}
                href="#findings"
                onClick={(e) => {
                  e.preventDefault();
                  onJumpToFinding(f);
                }}
              >
                Finding {f}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
