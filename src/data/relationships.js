// The inverse of each table's own `fks`/`weakfk` list: for every table, which other
// tables' foreign keys actually point AT it. Computed from the same TABLES data as
// everything else, so it can't drift — and it's a direct visual confirmation of things
// like Finding 1 (billing_addresses ends up with zero incoming references, because
// sales.billing_address_id — despite its name — really points at sales.id, not here).
export function buildIncomingRefs(tables) {
  const map = {};
  tables.forEach((t) => {
    map[t.n] = [];
  });

  tables.forEach((t) => {
    (t.fks || []).forEach((f) => {
      const targetTable = f.r.split('.')[0];
      if (map[targetTable]) {
        map[targetTable].push({ from: t.n, column: f.c, rule: f.d, bad: f.bad });
      }
    });
    (t.weakfk || []).forEach((w) => {
      const targetTable = w.r.split('.')[0];
      if (map[targetTable]) {
        map[targetTable].push({ from: t.n, column: w.c, weak: true });
      }
    });
  });

  Object.values(map).forEach((list) => list.sort((a, b) => a.from.localeCompare(b.from) || a.column.localeCompare(b.column)));
  return map;
}
