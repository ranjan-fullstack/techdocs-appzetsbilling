export const ENTITY_RELATIONSHIPS = `erDiagram
    BUSINESS_CATEGORIES ||--o{ BUSINESSES : categorizes
    PLANS ||--o{ PLAN_SUBSCRIBES : "priced as"
    PLAN_SUBSCRIBES ||--o{ BUSINESSES : "subscribed via (plan_subscribe_id, nullable)"
    GATEWAYS ||--o{ PLAN_SUBSCRIBES : "paid through"
    BUSINESSES ||--o{ BRANCHES : has
    BUSINESSES ||--o{ USERS : employs
    BUSINESSES ||--o{ STAFF : employs
    BUSINESSES ||--o{ DOMAINS : "custom domain"
    BUSINESSES ||--o{ BUSINESS_GATEWAYS : configures
    BUSINESSES ||--o{ CATEGORIES : defines
    BUSINESSES ||--o{ MENUS : defines
    BUSINESSES ||--o{ AREAS : defines
    BUSINESSES ||--o{ TABLES : defines
    BUSINESSES ||--o{ KITCHENS : defines
    BUSINESSES ||--o{ UNITS : defines
    BUSINESSES ||--o{ TAXES : defines
    BUSINESSES ||--o{ PAYMENT_TYPES : defines
    BUSINESSES ||--o{ COUPONS : defines
    BUSINESSES ||--o{ PARTIES : has
    BUSINESSES ||--o{ PRODUCTS : sells
    BUSINESSES ||--o{ MODIFIER_GROUPS : defines
    BUSINESSES ||--o{ INVENTORY_CATEGORIES : defines
    BUSINESSES ||--o{ INGREDIENTS : stocks
    BUSINESSES ||--o{ RECIPES : defines
    BUSINESSES ||--o{ STOCK_MOVEMENTS : logs
    BUSINESSES ||--o{ SALES : records
    BUSINESSES ||--o{ PURCHASES : records
    BUSINESSES ||--o{ QUOTATIONS : records
    BUSINESSES ||--o{ TRANSACTIONS : records
    BUSINESSES ||--o{ DUE_COLLECTS : records
    BUSINESSES ||--o{ EXPENSES : records
    BUSINESSES ||--o{ INCOMES : records
    BUSINESSES ||--o{ EMPLOYEES : employs
    BUSINESSES ||--o{ DEPARTMENTS : defines
    BUSINESSES ||--o{ DESIGNATIONS : defines
    BUSINESSES ||--o{ SHIFTS : defines
    BUSINESSES ||--o{ CASH_REGISTERS : operates
    BUSINESSES ||--o{ RESERVATIONS : takes
    BUSINESSES ||--o{ KOT_TICKETS : issues
    BUSINESSES ||--o{ LOYALTY_ITEMS : rewards

    BRANCHES ||--o{ USERS : "assigned to (optional)"
    CATEGORIES ||--o{ PRODUCTS : classifies
    MENUS ||--o{ PRODUCTS : groups
    PRODUCTS ||--o{ PRODUCT_VARIATIONS : has
    PRODUCTS ||--o{ MODIFIERS : has
    MODIFIER_GROUPS ||--o{ MODIFIER_GROUP_OPTIONS : has
    MODIFIER_GROUPS ||--o{ MODIFIERS : groups
    KITCHENS }o--o{ PRODUCTS : "routes (kitchen_product)"
    PRODUCTS ||--o{ LOYALTY_ITEMS : "eligible for"
    LOYALTY_ITEMS ||--o{ LOYALTY_ITEM_CUSTOMERS : "earned by"
    PARTIES ||--o{ LOYALTY_ITEM_CUSTOMERS : earns
    PARTIES ||--o{ DELIVERY_ADDRESSES : has
    PARTIES ||--o{ SALES : "buys as customer"
    PARTIES ||--o{ PURCHASES : "sells as supplier"
    PARTIES ||--o{ INGREDIENTS : "supplied by (optional)"
    UNITS ||--o{ UNITS : "base_unit_id (self-ref)"
    UNITS ||--o{ INGREDIENTS : measures
    INVENTORY_CATEGORIES ||--o{ INGREDIENTS : classifies
    INGREDIENTS ||--o{ RECIPE_INGREDIENTS : "used in"
    RECIPES ||--o{ RECIPE_INGREDIENTS : composed_of
    PRODUCTS ||--o{ RECIPES : "costed by"
    INGREDIENTS ||--o{ STOCK_MOVEMENTS : tracks
    INGREDIENTS ||--o{ PURCHASE_DETAILS : "line item"
    PURCHASES ||--o{ PURCHASE_DETAILS : contains
    PARTIES ||--o{ PURCHASES : "via party_id"
    AREAS ||--o{ TABLES : contains
    TABLES ||--o{ SALES : "dine-in at"
    TABLES ||--o{ KOT_TICKETS : "ticket for"
    STAFF ||--o{ SALES : served_by
    TAXES ||--o{ SALES : applies_to
    PAYMENT_TYPES ||--o{ SALES : "paid via"
    COUPONS ||--o{ SALES : discounts
    SALES ||--o{ SALES : "billing_address_id (self-ref, see Finding 1)"
    BUSINESS_GATEWAYS ||--o{ SALES : "online payment via"
    SALES ||--o{ SALE_DETAILS : contains
    SALE_DETAILS ||--o{ PRODUCTS : references
    KOT_TICKETS ||--o{ SALE_DETAILS : "kitchen-routes"
    KITCHENS ||--o{ KOT_TICKETS : prepares
    CANCEL_REASONS ||--o{ KOT_TICKETS : "cancel reason"
    SALES ||--o{ DUE_COLLECTS : "settles dues of"
    PURCHASES ||--o{ DUE_COLLECTS : "settles dues of"
    QUOTATIONS ||--o{ QUOTATION_DETAILS : contains
    QUOTATION_DETAILS ||--o{ PRODUCTS : references
    SALES ||--o{ TRANSACTIONS : "payment record"
    PURCHASES ||--o{ TRANSACTIONS : "payment record"
    PAYMENT_TYPES ||--o{ TRANSACTIONS : via
    USERS ||--o{ SALES : "created by (nullable)"
    USERS ||--o{ PRODUCTS : "created by (nullable)"
    USERS ||--o{ PARTIES : "linked to (nullable)"
    STAFF ||--o{ USERS : "staff_id (optional login link)"
    EMPLOYEES ||--o{ ATTENDANCES : clocks
    EMPLOYEES ||--o{ LEAVES : requests
    EMPLOYEES ||--o{ PAYROLLS : "paid via"
    DEPARTMENTS ||--o{ EMPLOYEES : groups
    DESIGNATIONS ||--o{ EMPLOYEES : titles
    SHIFTS ||--o{ EMPLOYEES : schedules
    LEAVE_TYPES ||--o{ LEAVES : categorizes
    CASH_REGISTERS ||--o{ CASH_REGISTER_TRANSACTIONS : logs
    RESERVATIONS ||--o{ RESERVATION_TABLES : "table assignment"
    TABLES ||--o{ RESERVATION_TABLES : reserved_in
`;

// Mermaid's own classDef parser only accepts literal color values (no var()/color-mix()),
// so this mirrors the --mod-* hex values from index.css rather than reading them.
const MODULE_HEX = {
  ten: '#7C6FB0', cat: '#B08040', pos: '#C05A3E', inv: '#5F8A3C',
  fin: '#3F7CA6', hr: '#A85585', mb: '#5C7A8A', mkt: '#B06590', sys: '#7A828C',
  cashregister: '#C79A1E', customdomain: '#5865C4', inventoryaddon: '#3C9A6E',
};

function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (c) => Math.max(0, c - amount);
  const r = clamp((n >> 16) & 0xff);
  const g = clamp((n >> 8) & 0xff);
  const b = clamp(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Built from the same TABLES/MODULES data as the reference list below, instead of being
// hand-maintained separately — so it can't drift out of sync the way the old hand-written
// version did (its "9 modules" predated the CashRegisterAddon/CustomDomainAddon/InventoryAddon
// split that a live code check turned up).
export function buildModuleHierarchy(tables, modules) {
  const root = tables.find((t) => t.scope === 'root');
  const lines = ['graph TD', `    ROOT["${root.n}<br/>tenant root · ${root.rows.toLocaleString()} rows"]:::root`, ''];

  modules.forEach((m) => {
    const count = tables.filter((t) => t.m === m.k).length;
    const label = m.name.replace(/&/g, '&amp;');
    lines.push(`    ROOT --> ${m.k}["${label}<br/>${count} table${count === 1 ? '' : 's'}"]:::${m.k}`);
  });

  lines.push('');
  modules.forEach((m) => {
    const top = tables
      .filter((t) => t.m === m.k)
      .sort((a, b) => b.rows - a.rows)
      .slice(0, 3);
    top.forEach((t, i) => {
      lines.push(`    ${m.k} --> ${m.k}_${i}[${t.n} · ${t.rows.toLocaleString()} rows]`);
    });
  });

  lines.push('', '    classDef root fill:#0E7C86,stroke:#0B5F67,color:#fff,font-weight:bold;');
  modules.forEach((m) => {
    lines.push(`    classDef ${m.k} fill:${MODULE_HEX[m.k]},stroke:${darken(MODULE_HEX[m.k], 40)},color:#fff;`);
  });

  return lines.join('\n') + '\n';
}

// Which of `tables` actually appear as an entity somewhere in `chart` — used both to
// report an accurate count (the hand-written "core 45 tables" heading was stale; the real
// number is computed here, not retyped) and to find what's left to draw elsewhere.
export function drawnEntityNames(chart, tables) {
  return tables.filter((t) => new RegExp(`\\b${t.n.toUpperCase()}\\b`).test(chart)).map((t) => t.n);
}

// A second diagram for every table the hand-curated core diagram above leaves out — so
// nothing in the schema is purely a text mention. Auto-generated from the same fks/weakfk
// data as everything else (plain column names as edge labels, not hand-written verbs; this
// diagram's job is completeness, not prose), so it can't go stale the way a hand-maintained
// "and 40 more tables" list would. Tables with no relationship at all to anything in this
// set still get drawn, as a bare box, rather than silently vanishing.
export function buildRemainingErDiagram(tables, remainingNames) {
  const remainingSet = new Set(remainingNames);
  const lines = ['erDiagram'];
  const touched = new Set();
  const seen = new Set();

  tables.forEach((t) => {
    (t.fks || []).forEach((f) => {
      const targetTable = f.r.split('.')[0];
      if (!remainingSet.has(t.n) && !remainingSet.has(targetTable)) return;
      const key = `${targetTable}->${t.n}->${f.c}`;
      if (seen.has(key)) return;
      seen.add(key);
      touched.add(t.n);
      touched.add(targetTable);
      lines.push(`    ${targetTable.toUpperCase()} ||--o{ ${t.n.toUpperCase()} : "${f.c}"`);
    });
    (t.weakfk || []).forEach((w) => {
      const targetTable = w.r.split('.')[0];
      if (!remainingSet.has(t.n) && !remainingSet.has(targetTable)) return;
      const key = `${targetTable}~>${t.n}->${w.c}`;
      if (seen.has(key)) return;
      seen.add(key);
      touched.add(t.n);
      touched.add(targetTable);
      lines.push(`    ${targetTable.toUpperCase()} |o..o{ ${t.n.toUpperCase()} : "${w.c} (no FK)"`);
    });
  });

  remainingNames.forEach((n) => {
    if (touched.has(n)) return;
    lines.push(`    ${n.toUpperCase()} {`, '        bigint id PK', '    }');
    touched.add(n);
  });

  return lines.join('\n') + '\n';
}

// Colors every entity by the module that owns its table, using the same palette
// as the module cards and table-reference dots, so the three views read as one system.
export function colorizeErDiagram(chart, tables, modules) {
  const byModule = new Map(modules.map((m) => [m.k, []]));
  for (const t of tables) {
    const entity = t.n.toUpperCase();
    if (new RegExp(`\\b${entity}\\b`).test(chart)) {
      byModule.get(t.m)?.push(entity);
    }
  }

  const classDefs = modules
    .map((m) => `    classDef ${m.k} fill:${MODULE_HEX[m.k]},stroke:${darken(MODULE_HEX[m.k], 40)},color:#fff;`)
    .join('\n');

  const classAssignments = modules
    .filter((m) => byModule.get(m.k).length)
    .map((m) => `    class ${byModule.get(m.k).join(',')} ${m.k}`)
    .join('\n');

  return `${chart}\n${classDefs}\n${classAssignments}\n`;
}
