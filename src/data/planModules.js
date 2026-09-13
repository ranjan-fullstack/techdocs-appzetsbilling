// The 18 real, per-subscription-plan feature toggles — literally the "Enabled Modules"
// checklist on the plan edit screen (admin/plans/edit.blade.php), keyed exactly as
// `available_modules[key]` is stored and read. This is NOT inferred: every key, every
// gated route, and the one bug below came from grepping the actual VPS source
// (app/Helpers/Helper.php:plan_module_enabled, App\Services\ModuleSubscriptionService,
// App\Http\Middleware\CheckModuleAccess) and cross-checking against the live `plans`
// table. It answers, for the first time in this doc, the question the Findings section
// used to mark "could not be verified": yes, available_modules is enforced — both by
// hiding sidebar links (`@if(plan_module_enabled(...))` in the Blade sidebars) and by
// blocking the underlying routes (CheckModuleAccess middleware, aliased 'module' in
// Kernel.php).
export const PLAN_MODULES = [
  {
    key: 'sales', label: 'Sales', addon: null,
    tables: ['sales', 'sale_details', 'sale_detail_options', 'sale_detail_product_variations'],
    evidence: "route pattern business.sales.* (ModuleSubscriptionService::routeMap)",
  },
  {
    key: 'purchases', label: 'Purchase', addon: null,
    tables: ['purchases', 'purchase_details'],
    evidence: "route pattern business.purchases.*",
  },
  {
    key: 'quotations', label: 'Quotation', addon: null,
    tables: ['quotations', 'quotation_details', 'quotation_detail_options', 'quotation_detail_product_variations'],
    evidence: "route patterns business.quotations.*, business.quotation-reports.*",
  },
  {
    key: 'products', label: 'Products', addon: null,
    tables: ['products', 'categories', 'product_variations', 'units'],
    evidence: "route patterns business.products.*, business.categories.*, business.bulk-uploads.*; URL-segment map units/variations → products",
  },
  {
    key: 'kitchen', label: 'Kitchen', addon: null,
    tables: ['kitchens', 'kot_tickets', 'kitchen_product', 'cancel_reasons'],
    evidence: "route patterns business.kitchens.*, business.kots.*, business.kot-reports.*",
  },
  {
    key: 'reservation', label: 'Reservation', addon: null,
    tables: ['reservations', 'reservation_tables', 'time_slots'],
    evidence: "routes named business.reservations.* (Modules/RestaurantWebAddon/routes/web.php)",
    bug: "CONFIRMED LIVE BUG (Finding 19): the plan checkbox saves available_modules['reservation'] (singular — see the $modules array in admin/plans/edit.blade.php), but ModuleSubscriptionService::routeMap() keys the reservations routes as 'reservations' (plural), so the middleware always evaluates plan_module_enabled('reservations') — a key that never exists in any real plan's JSON (checked live: all 5 plans have .reservation set, none have .reservations). Every reservation route is denied regardless of the toggle, even though the sidebar link (which correctly checks the singular key) still shows.",
  },
  {
    key: 'parties', label: 'Parties', addon: null,
    tables: ['parties', 'delivery_addresses'],
    evidence: "route pattern business.parties.*, plus the inline customer/supplier-create routes off sales and purchases",
  },
  {
    key: 'incomes', label: 'Incomes', addon: null,
    tables: ['incomes', 'income_categories'],
    evidence: "route pattern business.incomes.*",
  },
  {
    key: 'expenses', label: 'Expenses', addon: null,
    tables: ['expenses', 'expense_categories'],
    evidence: "route pattern business.expenses.*",
  },
  {
    key: 'taxes', label: 'Tax', addon: null,
    tables: ['taxes'],
    evidence: "route pattern business.taxes.*",
  },
  {
    key: 'dues', label: 'Due List', addon: null,
    tables: ['due_collects'],
    evidence: "route patterns business.dues.*, business.walk-dues.*, business.collect.dues.*, business.collect.walk-dues.*",
  },
  {
    key: 'payment-types', label: 'Payment Type', addon: null,
    tables: ['payment_types'],
    evidence: "route pattern business.payment-types.*",
  },
  {
    key: 'reports', label: 'Reports', addon: null,
    tables: [],
    evidence: "route patterns business.*-reports.* (sale, purchase, vat, income, expense, due, supplier-due, subscription, due-collect)",
    note: "Owns no tables of its own — every one of those report routes reads sales/purchases/taxes/incomes/expenses/due_collects/plan_subscribes, gated by whichever of those modules is also enabled.",
  },
  {
    key: 'branches', label: 'Branch', addon: 'MultiBranchAddon',
    tables: ['branches', 'countries', 'states', 'roles', 'permissions', 'model_has_roles', 'model_has_permissions', 'role_has_permissions'],
    evidence: "route patterns multibranch.branches.*, business.roles.*",
    bug: "SURPRISING BUT CONFIRMED (Finding 20): business.roles.* is UserRoleController — ordinary Roles & Permissions management, unrelated to branches on its face — yet it's gated under the same 'branches' plan module. A tenant on a plan without Branch enabled cannot manage roles/permissions at all.",
  },
  {
    key: 'hrm', label: 'HRM', addon: 'HrmAddon',
    tables: ['departments', 'designations', 'shifts', 'employees', 'leave_types', 'leaves', 'holidays', 'attendances', 'payrolls'],
    evidence: "route pattern hrm.*, plus the URL-segment fallback map (departments, designations, employees, holidays, leave-types, leaves, payrolls, shifts, attendances → hrm)",
  },
  {
    key: 'cash-register', label: 'Cash Register', addon: 'CashRegisterAddon',
    tables: ['cash_registers', 'cash_register_transactions', 'denominations', 'configurations'],
    evidence: "route pattern cashregisteraddon.*",
  },
  {
    key: 'inventory', label: 'Inventory', addon: 'InventoryAddon',
    tables: ['inventory_categories', 'recipes', 'recipe_ingredients', 'stock_movements'],
    evidence: "route pattern inventoryaddon.*",
    note: "ingredients and stocks are NOT gated here — InventoryAddon's own App/Models only cover these 4 tables (confirmed in the earlier module-ownership check); ingredient/stock-counter management lives in core, ungated by any plan module.",
  },
  {
    key: 'online-store', label: 'Online Store', addon: 'RestaurantOnlineStore',
    tables: ['testimonials', 'blogs', 'comments'],
    evidence: "route pattern onlineStore.*, business.website-settings.*, business.testimonials.*, business.term-conditions.*, business.privacy-policy.*, business.blogs.*, business.comments.*",
  },
];

// Every table NOT reachable from PLAN_MODULES above is unaffected by available_modules —
// it's either core functionality no plan can turn off, a superadmin-only screen, or a
// framework table with no page at all. Computed at import time so this can never drift.
export function ungatedTables(allTables) {
  const gated = new Set(PLAN_MODULES.flatMap((m) => m.tables));
  return allTables.filter((t) => !gated.has(t.n)).map((t) => t.n);
}

// Every table maps to at most one plan module (verified: zero double-gated tables) — so a
// simple name -> module lookup is safe and lets a table row show its plan-entitlement
// status without a reader having to separately search §05 for it.
export function tablePlanModuleMap(planModules) {
  const map = {};
  planModules.forEach((m) => {
    m.tables.forEach((t) => {
      map[t] = m;
    });
  });
  return map;
}
