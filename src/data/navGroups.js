// Grouping is taken directly from the real app's own navigation — the shop-owner sidebar
// (Dashboard, POS, Orders, Kitchens, Purchases, Inventory, Reservations, Tables, Menus,
// Parties, Due List, Coupon, Branch, Incomes, Expenses, Transaction, Cash Register, VAT,
// Staff, Subscriptions, Payment Type, HRM, My Domains, Messages, Settings, Newsletters...)
// and the superadmin sidebar (Store List, Category List, Subscription List/Plan, Domains
// List, Front CMS, Staff Manage, Roles & Permissions...) — not an invented taxonomy. Every
// table below is placed under the nav item whose screen actually reads/writes it; a few
// (System / Framework) have no UI page at all — that's a fact about the app, not a gap here.
export const NAV_GROUPS = [
  { k: 'posOrders', name: 'POS & Orders', side: 'shop-owner', desc: 'Checkout and order history — the sales/quotation transaction and their line items.' },
  { k: 'kitchens', name: 'Kitchens', side: 'shop-owner', desc: 'Kitchen Order Tickets (KOT) — routes sale line items to a prep station.' },
  { k: 'purchases', name: 'Purchases', side: 'shop-owner', desc: 'Supplier purchase orders and their line items.' },
  { k: 'inventory', name: 'Inventory', side: 'shop-owner', desc: 'Raw-material stock: categories, recipes/BOM, the stock ledger, units of measure.' },
  { k: 'reservations', name: 'Reservations', side: 'shop-owner', desc: 'Table bookings and the online-ordering/reservation time-slot calendar.' },
  { k: 'tables', name: 'Tables', side: 'shop-owner', desc: 'Physical floor plan — areas and the tables within them.' },
  { k: 'menus', name: 'Menus', side: 'shop-owner', desc: 'Sellable catalog: categories, products, variations, modifiers, loyalty eligibility.' },
  { k: 'parties', name: 'Parties', side: 'shop-owner', desc: 'Customer/supplier contact book and their delivery/billing addresses.' },
  { k: 'dueList', name: 'Due List', side: 'shop-owner', desc: 'Partial/installment payments against an outstanding sale or purchase balance.' },
  { k: 'coupon', name: 'Coupon', side: 'shop-owner', desc: 'Discount codes.' },
  { k: 'branch', name: 'Branch', side: 'shop-owner', desc: 'Sub-location support — branches and the geography reference tables they use.' },
  { k: 'incomes', name: 'Incomes', side: 'shop-owner', desc: 'Manual income entries and their categories.' },
  { k: 'expenses', name: 'Expenses', side: 'shop-owner', desc: 'Manual expense entries and their categories.' },
  { k: 'transaction', name: 'Transaction', side: 'shop-owner', desc: 'Generic payment ledger row against a sale or purchase.' },
  { k: 'cashRegister', name: 'Cash Register', side: 'shop-owner', desc: 'Shift-based cash drawer sessions, denominations, and feature configuration.' },
  { k: 'vat', name: 'VAT', side: 'shop-owner', desc: 'Tax rates, including compound sub-taxes.' },
  { k: 'staffRoles', name: 'Staff & Roles', side: 'shop-owner', desc: 'Logins, the lightweight staff directory used on sales, and role/permission grants.' },
  { k: 'subscriptions', name: 'Subscriptions', side: 'shop-owner', desc: "A tenant's plan, subscription history, and payment gateway catalog/credentials." },
  { k: 'paymentType', name: 'Payment Type', side: 'shop-owner', desc: 'Per-tenant payment method list.' },
  { k: 'hrm', name: 'HRM', side: 'shop-owner', desc: 'Departments, shifts, attendance, leave, payroll — a separate person model from Staff.' },
  { k: 'myDomains', name: 'My Domains', side: 'shop-owner', desc: "A tenant's custom-domain mapping." },
  { k: 'messages', name: 'Messages', side: 'shop-owner', desc: 'Public contact-form submissions.' },
  { k: 'newsletters', name: 'Newsletters', side: 'shop-owner', desc: 'Newsletter signups.' },
  { k: 'settings', name: 'Settings', side: 'shop-owner', desc: 'System-wide lookups: generic key/value options, currencies, languages.' },
  { k: 'storeList', name: 'Store List', side: 'admin', desc: 'Superadmin: every tenant business on the platform.' },
  { k: 'categoryList', name: 'Category List', side: 'admin', desc: 'Superadmin: the restaurant/business type taxonomy shown on Store List.' },
  { k: 'frontCms', name: 'Front CMS', side: 'admin', desc: 'Superadmin: the public marketing site — blog, FAQs, feature blocks, testimonials, reviews.' },
  { k: 'system', name: 'System / Framework', side: 'system', desc: "Laravel plumbing with no page of its own — nothing in the sidebar points here." },
];

export const TABLE_NAV_GROUP = {
  // POS & Orders
  sales: 'posOrders', sale_details: 'posOrders', sale_detail_options: 'posOrders', sale_detail_product_variations: 'posOrders',
  quotations: 'posOrders', quotation_details: 'posOrders', quotation_detail_options: 'posOrders', quotation_detail_product_variations: 'posOrders',
  // Kitchens
  kitchens: 'kitchens', kitchen_product: 'kitchens', kot_tickets: 'kitchens', cancel_reasons: 'kitchens',
  // Purchases
  purchases: 'purchases', purchase_details: 'purchases',
  // Inventory
  ingredients: 'inventory', inventory_categories: 'inventory', recipes: 'inventory', recipe_ingredients: 'inventory',
  stock_movements: 'inventory', stocks: 'inventory', units: 'inventory',
  // Reservations
  reservations: 'reservations', reservation_tables: 'reservations', time_slots: 'reservations',
  // Tables
  tables: 'tables', areas: 'tables',
  // Menus
  categories: 'menus', menus: 'menus', products: 'menus', product_variations: 'menus', modifier_groups: 'menus',
  modifier_group_options: 'menus', modifiers: 'menus', loyalty_items: 'menus', loyalty_item_customers: 'menus',
  // Parties
  parties: 'parties', delivery_addresses: 'parties', billing_addresses: 'parties',
  // Due List
  due_collects: 'dueList',
  // Coupon
  coupons: 'coupon',
  // Branch
  branches: 'branch', countries: 'branch', states: 'branch',
  // Incomes
  incomes: 'incomes', income_categories: 'incomes',
  // Expenses
  expenses: 'expenses', expense_categories: 'expenses',
  // Transaction
  transactions: 'transaction',
  // Cash Register
  cash_registers: 'cashRegister', cash_register_transactions: 'cashRegister', denominations: 'cashRegister', configurations: 'cashRegister',
  // VAT
  taxes: 'vat',
  // Staff & Roles
  staff: 'staffRoles', users: 'staffRoles', roles: 'staffRoles', permissions: 'staffRoles',
  model_has_roles: 'staffRoles', model_has_permissions: 'staffRoles', role_has_permissions: 'staffRoles', personal_access_tokens: 'staffRoles',
  // Subscriptions
  plan_subscribes: 'subscriptions', plans: 'subscriptions', gateways: 'subscriptions', business_gateways: 'subscriptions',
  // Payment Type
  payment_types: 'paymentType',
  // HRM
  departments: 'hrm', designations: 'hrm', shifts: 'hrm', employees: 'hrm', leave_types: 'hrm',
  leaves: 'hrm', holidays: 'hrm', attendances: 'hrm', payrolls: 'hrm',
  // My Domains
  domains: 'myDomains',
  // Messages
  messages: 'messages',
  // Newsletters
  news_letters: 'newsletters',
  // Settings
  options: 'settings', currencies: 'settings', user_currencies: 'settings', languages: 'settings',
  // Store List (admin)
  businesses: 'storeList',
  // Category List (admin)
  business_categories: 'categoryList',
  // Front CMS (admin)
  blogs: 'frontCms', comments: 'frontCms', faqs: 'frontCms', features: 'frontCms',
  testimonials: 'frontCms', pos_app_interfaces: 'frontCms', reviews: 'frontCms',
  // System / Framework
  migrations: 'system', jobs: 'system', failed_jobs: 'system', password_resets: 'system',
  password_reset_tokens: 'system', notifications: 'system',
};
