import { useEffect, useMemo, useState } from 'react';
import TableRow from './TableRow.jsx';
import { NAV_GROUPS, TABLE_NAV_GROUP } from '../data/navGroups.js';

const SCOPES = ['all', 'root', 'direct', 'transitive', 'global'];
const SIDE_LABEL = { 'shop-owner': 'Shop-owner app', admin: 'Superadmin app', system: 'No UI page' };

export default function TableList({ tables, modules, activeScope, onScopeChange, onJumpToFinding, resetSignal, incomingRefs }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // Clicking an app-area card (04) jumps here expecting to see that area's full table
  // list — not that list silently intersected with search text left over from earlier browsing.
  useEffect(() => {
    if (resetSignal !== undefined) setQuery('');
  }, [resetSignal]);

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((g) => {
        const groupTables = tables.filter((t) => TABLE_NAV_GROUP[t.n] === g.k);
        const rows = groupTables.map((t) => {
          const matchesQ = !q || t.n.includes(q);
          const matchesScope = activeScope === 'all' || t.scope === activeScope;
          return { table: t, hidden: !(matchesQ && matchesScope) };
        });
        return { group: g, total: groupTables.length, rows, shown: rows.filter((r) => !r.hidden).length };
      }),
    [tables, q, activeScope],
  );

  const totalShown = groups.reduce((sum, g) => sum + g.shown, 0);

  const clearFilters = () => {
    setQuery('');
    onScopeChange('all');
  };

  return (
    <>
      <div className="chiprow">
        <span className="chip"><i className="dot" style={{ background: 'var(--accent)' }} /> ON DELETE CASCADE</span>
        <span className="chip"><i className="dot" style={{ background: 'var(--info)' }} /> ON DELETE SET NULL</span>
        <span className="chip"><i className="dot" style={{ background: 'var(--warn)' }} /> NO ACTION (no rule set)</span>
        <span className="chip"><i className="dot" style={{ background: 'var(--crit)' }} /> Confirmed defect</span>
        <span className="chip" style={{ borderStyle: 'dashed' }}><i className="dot" style={{ background: 'var(--ink-faint)' }} /> Column has no FK constraint</span>
        <span className="chip"><i className="dot" style={{ background: 'var(--warn)' }} /> Soft delete (deleted_at) — 2 tables</span>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search table name…"
          aria-label="Search tables"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="pillgroup">
          {SCOPES.map((s) => (
            <button key={s} className="pill" aria-pressed={activeScope === s} onClick={() => onScopeChange(s)}>
              {s === 'all' ? 'All scopes' : s}
            </button>
          ))}
        </div>
      </div>
      <div className="resultcount">Showing {totalShown} of {tables.length} tables, grouped by where they actually show up in the app</div>
      {totalShown === 0 && (
        <div className="noresults">
          No table matches this search + scope combination.{' '}
          <button type="button" className="pill" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {groups.filter((g) => g.shown > 0).map(({ group, rows, shown, total }) => (
        <div className="navgroup" id={`nav-${group.k}`} key={group.k}>
          <div className="navgroup-head">
            <h3>{group.name}</h3>
            <span className="navgroup-side">{SIDE_LABEL[group.side]}</span>
            <span className="navgroup-count">{shown === total ? total : `${shown} of ${total}`} table{total === 1 ? '' : 's'}</span>
          </div>
          <p className="navgroup-desc">{group.desc}</p>
          <div className="tlist">
            {rows.map(({ table, hidden }) => (
              <TableRow
                key={table.n}
                table={table}
                moduleName={modules.find((m) => m.k === table.m).name}
                hidden={hidden}
                onJumpToFinding={onJumpToFinding}
                incomingRefs={incomingRefs[table.n] || []}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
