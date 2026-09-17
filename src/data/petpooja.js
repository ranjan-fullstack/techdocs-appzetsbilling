// AppZetBilling vs Petpooja — capability gap analysis and roadmap. Built from a fresh read-only
// SSH inspection of the production VPS (2026-09-18) plus independent research on Petpooja and the
// delivery/payment platforms. No Petpooja integration is proposed anywhere here — every
// recommendation is for AppZetBilling to build the equivalent capability itself. Nothing on
// production was modified, restarted, or deployed to produce this analysis.

export const STATS = [
  { k: 'Categories already built (§02)', v: '10+' },
  { k: 'Real gaps identified (§03)', v: '13' },
  { k: 'Roadmap phases', v: '5' },
  { k: 'Vendor questions open (§16)', v: '8' },
];

export const PETPOOJA_CATEGORIES = [
  { t: 'A. POS and restaurant operations', d: 'Billing, split/merge bills, discounts, table management with a floor-plan view, dine-in/takeaway/delivery order types from one system, KOT generation, a Kitchen Display System (KDS), a captain-ordering app, token/queue management, multi-outlet support, staff roles, offline billing. Offline-billing mechanics are unverified in technical detail.' },
  { t: 'B. Online ordering and delivery', d: "Petpooja's own online-ordering storefront per restaurant, QR ordering, and a dashboard that aggregates orders arriving from Zomato and Swiggy alongside the restaurant's own channel. This aggregator-order dashboard is Petpooja's actual product — not evidence that Zomato/Swiggy expose an open API Petpooja simply calls (see §05)." },
  { t: 'C. Inventory and purchase management', d: 'Automatic inventory deduction based on item sales, raw-material consumption tracking, low-stock alerts, purchase and expense reports. Batch/expiry tracking and multi-branch transfer are common in this product category generally but were not independently confirmed for Petpooja specifically.' },
  { t: 'D. WhatsApp and customer communication', d: 'WhatsApp-based bill/order notifications, typically through a BSP layered on Meta’s Cloud API rather than a bespoke integration — consistent with the platform mechanics already verified on the dedicated WhatsApp Business Module page (referenced directly in §06).' },
  { t: 'E. Payments', d: 'Google Pay and other UPI rails, plus "Pi" (Petpooja’s own in-house payments/QR product) are named in Petpooja’s own materials; multi-gateway support is standard in this category. Exact gateway list and settlement model are unverified beyond §07.' },
  { t: 'F. Loyalty and marketing', d: 'Customer database, feedback capture, and marketing/CRM tools are commonly bundled by Petpooja and competitors; specific mechanics (points formula, membership tiers, gift cards) are unverified for Petpooja specifically.' },
  { t: 'G. Reports and BI', d: 'Sales analytics, purchase/expense reports, P&L summaries, branch comparison, exportable reports — consistently described across independent sources.' },
  { t: 'H. Hardware', d: "Thermal/kitchen printers, KDS screens, and (for Petpooja's separate HR product) biometric attendance hardware are referenced across sources; exact supported models and driver mechanism are unverified." },
];

export const PETPOOJA_CAVEAT = "Petpooja is a private company; it does not publish a full public API reference or self-serve pricing, so this benchmark combines its own site content, independent review platforms (Capterra, SoftwareAdvice, SelectHub, SoftwareSuggest), and general market knowledge of Indian restaurant-POS practice — marked unverified anywhere a claim couldn't be confirmed against a primary source. A direct fetch of petpooja.com's homepage returned inconsistent content (product names that don't match Petpooja's known restaurant-POS positioning), so that fetch is treated as unreliable and not relied on — see §18.";

export const APPZET_CAPABILITIES = [
  { t: 'POS & billing', d: 'Sale/SaleDetails (app/Models/Sale.php), created by AcnooSaleController::store(). Split payment types, discounts, coupons, delivery charge, tips, dine-in/takeaway/delivery via sales_type, table assignment, and a due/partial-payment model (DueCollect). ReportsController covers sales, purchase, quotation, due-collection, income, expense, and transaction reports.' },
  { t: 'Table & floor management', d: 'Table (area_id, capacity, is_booked, qr_code, status, type) and Area models, with AcnooTableController/AcnooAreaController. Each table already has a qr_code column and a live latestSale/kot_ticket relation — the schema for QR-code-per-table ordering exists; whether the online-store customer flow actually consumes a table’s QR to pre-fill a dine-in order wasn’t confirmed (§16).' },
  { t: 'Kitchen routing / KOT / KDS backend', d: 'Kitchen model (named prep stations) with a kitchen_product pivot; KotTicket groups a sale’s line items by kitchen automatically at sale-creation time. AcnooKotController exposes cooking_status/kot_status transitions and cancel reasons; AcnooKitchenController exposes item-assign/item-delete/unassigned-product. A real, working KOT-routing backend. Whether a literal KDS screen UI exists in this Laravel app or only in a separate POS client is unconfirmed.' },
  { t: 'Cash register / shift management', d: 'CashRegister, CashRegisterTransaction, Denomination models; opening/closing shift flows, an approvals workflow, and dedicated shift/ledger/difference/open-shift/closed-shift reports with PDF/Excel export.' },
  { t: 'Inventory & recipe-based stock deduction', d: 'Ingredient, Unit, InventoryCategory, Recipe/RecipeIngredient, StockMovement. StockService implements stockIn/stockOut/adjust/damage with unit conversion; SaleObserver/PurchaseObserver automatically call processSale()/processPurchase() on every Sale/Purchase — ingredient stock is deducted via the product’s Recipe on every sale already. A materially complete recipe-costing engine, not a gap.' },
  { t: 'Purchase & supplier management', d: 'Purchase/PurchaseDetails (PurchaseController), tied into the stock-in flow above.' },
  { t: 'Restaurant-branded online ordering storefront', d: "A full customer-facing site per tenant: menu browsing, cart, checkout (dine-in/delivery/pickup via sales_type, coupon application, a single tenant-wide delivery-charge option, gateway or manual/offline payment), customer accounts, order history, table reservations, reviews, blogs/testimonials, newsletter. Combined with CustomDomainAddon and Business::publicQrUrl(), a tenant already gets a branded, domain-mapped ordering site with QR access." },
  { t: 'Loyalty & coupons', d: 'LoyaltyItem (which products earn points) + LoyaltyItemCustomer (per-customer accrual) + AcnooLoyalityPointConfigController; Coupon (named code, date range, percentage/amount discount). Basic, product-eligibility-based points and simple coupons exist; no membership tiers, gift cards, or birthday-offer automation (§03).' },
  { t: 'Per-tenant payment gateways', d: 'BusinessGateway: per-Business gateway config (credentials JSON, test/live mode, convenience charge, manual/offline methods with instructions + proof upload, phone_required). Backed by Razorpay, Stripe, Mollie, PayTM, PhonePe, Omnipay already in composer.json. A new gateway plugs in as a new adapter, not a rewrite. The online-store checkout’s payment flow is redirect-based only — no payment webhook/IPN handler was found for customer order payments (a real gap, §07).' },
  { t: 'HRM', d: 'Employee, Department, Designation, Shift, Attendance, Leave/LeaveType, Holiday, Payroll, each with its own API controller and Excel export. HR/payroll, not POS staff-performance analytics — that comes from ReportsController against Sale.staff_id.' },
  { t: 'Multi-branch', d: 'Branch model; nearly every tenant-owned model already carries branch_id and is scoped by a shared BranchScope global scope.' },
  { t: 'Reporting exports', d: 'Every module inspected ships matching index/pdf/excel-csv/datas Blade views and an Exports/*.php class per list screen, via maatwebsite/excel + barryvdh/laravel-dompdf. Platform-wide convention, not a gap to build.' },
];

export const APPZET_ABSENT_NOTE = "A repo-wide search found zero references to WhatsApp, SMS, Zomato, Swiggy, Uber Eats, thermal/barcode/printer hardware drivers, batch numbers, or expiry dates anywhere in the codebase.";

export const GAP_TABLE = {
  cols: ['Petpooja capability', 'AppZetBilling existing support', 'Gap', 'Required changes', 'External dependency', 'Complexity', 'Cost impact'],
  rows: [
    { label: 'POS billing, split/discounts, table mgmt', vals: ['Yes', 'Yes — Sale, Table/Area (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'KOT + kitchen routing', vals: ['Yes', 'Yes — Kitchen, KotTicket, AcnooKotController (§02)', 'KDS screen unconfirmed', "Verify/build a KDS view if the POS client doesn't already have one", 'None', 'Low–Medium', 'Low'] },
    { label: 'Cash register / shift management', vals: ['Yes', 'Yes — CashRegisterAddon (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'Recipe-based stock deduction', vals: ['Yes', 'Yes — StockService, SaleObserver (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'Purchase/supplier management', vals: ['Yes', 'Yes — Purchase/PurchaseDetails (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'Restaurant-branded online ordering site', vals: ['Yes', 'Yes — RestaurantOnlineStore (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'Table reservation booking', vals: ['Yes', 'Yes — Reservation/TimeSlot (§02)', 'None confirmed', '—', 'None', '—', '—'] },
    { label: 'QR-code table ordering', vals: ['Yes (claimed)', 'Partial — Table.qr_code exists; online-menu flow consuming it unconfirmed', 'Verify or wire the missing link', 'Small: pass table_id through the QR URL into checkout', 'None', 'Low', 'Low'] },
    { label: 'CSV/Excel/PDF report export', vals: ['Yes', 'Yes, platform-wide convention (§02)', 'None', '—', 'None', '—', '—'] },
    { label: 'Basic coupons', vals: ['Yes', 'Yes — Coupon model (§02)', 'No usage-limit/min-order fields confirmed', 'Small schema addition if needed', 'None', 'Low', 'Low'] },
    { label: 'Loyalty points', vals: ['Yes', 'Partial — LoyaltyItem/LoyaltyItemCustomer (§02)', 'No tiers, no automation', 'New rules engine (§08)', 'None', 'Medium', 'Low'] },
    { label: 'Gift cards', vals: ['Yes (claimed)', 'No', 'Full gap', 'New GiftCard model + redemption flow', 'None', 'Medium', 'Low'] },
    { label: 'Membership tiers', vals: ['Yes (claimed)', 'No', 'Full gap', 'New tier model tied to loyalty points', 'None', 'Medium', 'Low'] },
    { label: 'Birthday/segment marketing automation', vals: ['Yes (claimed)', 'No', 'Full gap', 'New campaign scheduler, tied to WhatsApp/email/SMS', 'Meta Cloud API / SMS provider', 'Medium', 'Medium — message costs'] },
    { label: 'Customer order-payment webhooks/reconciliation', vals: ['Assumed standard', 'No — redirect-only flow found (§02)', 'Real gap', 'Webhook endpoints per gateway, reconciliation job', 'Razorpay/Cashfree/etc.', 'Medium', 'Low'] },
    { label: 'UPI / payment links', vals: ['Yes', 'Partial — BusinessGateway pattern exists, no evidence of Payment Links API usage', 'Add Payment Links + webhooks', 'New gateway adapter methods (§07)', 'Razorpay/Cashfree APIs', 'Medium', 'Low–Medium, per-txn gateway fees'] },
    { label: 'Separate merchant account per tenant', vals: ["Yes (Petpooja's Pi product)", 'No — BusinessGateway already isolates credentials per tenant, which covers most of the same need', 'Verify whether true sub-merchant routing is wanted', 'Only needed if AppZetBilling itself becomes the payment aggregator', 'Razorpay Route / Cashfree Easy Split', 'High', 'Medium–High'] },
    { label: 'WhatsApp messaging', vals: ['Yes', 'No — confirmed zero WhatsApp code in the repo', 'Full gap — already fully designed', 'See §06', 'Meta WhatsApp Cloud API', 'Medium', 'Medium — per-message Meta charges'] },
    { label: 'SMS notifications', vals: ['Yes (industry-standard)', 'No', 'Full gap', 'New SMS provider adapter, same pattern as WhatsApp', 'An SMS gateway', 'Low–Medium', 'Low–Medium'] },
    { label: 'Batch/expiry tracking', vals: ['Common in category', 'No', 'Full gap', 'New columns + expiry alert job', 'None', 'Medium', 'Low'] },
    { label: 'Stock transfer between branches', vals: ['Common in category', 'Partial — MultiBranchAddon exists but no transfer-specific flow found', 'Add a StockTransfer entity', 'New model + two-sided StockMovement pair', 'None', 'Medium', 'Low'] },
    { label: 'Food cost % reporting', vals: ['Common in category', 'Partial — Recipe has ingredient costs; no consolidated report found', 'New report over existing data', 'Mostly a reporting query, not new data', 'None', 'Low', 'Low'] },
    { label: 'Zomato/Swiggy/Uber Eats order aggregation', vals: ['Yes', 'No', 'Full gap — partner-gated, not open APIs', 'See §05', 'Zomato/Swiggy/Uber Eats partner approval', 'High', 'High — commercial terms unknown'] },
    { label: 'Thermal/kitchen printer support', vals: ['Yes', 'No server-side driver code found', 'Unclear — verify with POS client owner', 'Depends on where printing actually happens today', 'Printer SDKs (ESC/POS)', 'Unclear', 'Unclear'] },
    { label: 'Biometric/HR hardware', vals: ["Petpooja's separate HR product", 'No', 'Not recommended — out of scope', '—', '—', '—', '—'] },
  ],
};

export const ARCH_POINTS = [
  { t: 'Provider adapter interface per capability', d: 'One Laravel interface per integration family (DeliveryProviderInterface, PaymentProviderInterface, MessagingProviderInterface), one concrete class per vendor (ZomatoAdapter, RazorpayAdapter, WhatsAppCloudApiAdapter). Business logic calls the interface, never the vendor SDK directly — swapping or adding a vendor is one new class.' },
  { t: 'Tenant-level credentials, branch-level configuration', d: 'A generic integration_connections table (business_id, branch_id nullable, provider, encrypted credentials, status), replacing what would otherwise be N bespoke credential tables. BusinessGateway already proves this pattern works for payments; this generalizes it.' },
  { t: 'Webhooks in, jobs out', d: 'Every inbound event lands in a generic integration_webhook_events table first (idempotent on a provider event id), then a queued job processes it. Every outbound call is queued, never synchronous in a request — so one slow/down vendor never blocks checkout or billing.' },
  { t: 'Retry, idempotency, rate limiting', d: "Standard Laravel ShouldQueue retry/backoff; an idempotency key per outbound action; a RateLimiter per connection sized below each vendor's published limit." },
  { t: 'Audit log + integration health', d: "Every connection's last-success/last-failure/error-count feeds one integration_health view, surfaced to both the tenant and AppZetBilling's own SaaS-admin dashboard (§11)." },
  { t: 'Subscription-gated', d: 'Every capability is a Plan.available_modules entry, checked by the same moduleCheck() helper already gating InventoryAddon etc. (§02, §13) — no separate feature-flag system to build.' },
];

export const ARCH_DIAGRAM = `flowchart TD
    subgraph Tenant["Restaurant tenant (Business)"]
        Admin["Admin panel\\nIntegrations dashboard"]
    end

    Admin -->|"connect provider"| Conn[("integration_connections\\nbusiness_id, branch_id,\\nprovider, credentials")]

    subgraph Core["AppZetBilling core (existing)"]
        Sale["Sale / Purchase / Party\\n(existing models)"]
        Events["Domain events\\n(SaleCreated, PaymentReceived...)"]
    end

    Sale --> Events --> Jobs

    subgraph Adapters["Provider adapter layer (new)"]
        DP["DeliveryProviderInterface\\nZomato / Swiggy / UberEats"]
        PP["PaymentProviderInterface\\nRazorpay / Cashfree / Stripe"]
        MP["MessagingProviderInterface\\nWhatsApp / SMS / Email"]
    end

    Jobs["Queued jobs\\n(retry + backoff + idempotency)"] --> DP & PP & MP
    Conn --> DP & PP & MP

    DP --> Zomato["Zomato / Swiggy APIs"]
    PP --> Gateway["Razorpay / Cashfree APIs"]
    MP --> Meta["Meta WhatsApp Cloud API"]

    Zomato -->|"order webhook"| Hook[("integration_webhook_events")]
    Gateway -->|"payment webhook"| Hook
    Meta -->|"status webhook"| Hook
    Hook --> Jobs

    Conn --> Health["integration_health\\n(tenant + SaaS-admin view)"]`;

export const FOLDER_STRUCTURE = `Modules/
  IntegrationsCore/                  # shared adapter interfaces, connection model, health service
    App/Contracts/DeliveryProviderInterface.php
    App/Contracts/PaymentProviderInterface.php
    App/Contracts/MessagingProviderInterface.php
    App/Models/IntegrationConnection.php
    App/Models/IntegrationWebhookEvent.php
    App/Services/IntegrationHealthService.php
  DeliveryAddon/                     # Phase 5
    App/Adapters/ZomatoAdapter.php
    App/Adapters/SwiggyAdapter.php
    App/Jobs/SyncMenuJob.php
    App/Jobs/PullOrderJob.php
  PaymentsAddon/                     # Phase 2
    App/Adapters/RazorpayAdapter.php
    App/Adapters/CashfreeAdapter.php
    App/Http/Controllers/Api/PaymentWebhookController.php
  WhatsAppAddon/                     # Phase 3 — already fully designed, see the WhatsApp Business Module page
  LoyaltyAddon/                      # Phase 3
    App/Models/GiftCard.php
    App/Models/MembershipTier.php`;

export const ARCH_NOTE = "This keeps every capability additive and independently disable-able via modules_statuses.json — consistent with how AppZetBilling already ships CashRegisterAddon, InventoryAddon, etc. No tenant gets custom code; every tenant gets the same adapters, gated by their Plan.";

export const OWN_CHANNEL_NOTE = "AppZetBilling already has a complete tenant-branded ordering site (§02): menu browsing, cart, checkout (dine-in/pickup/delivery), coupons, customer accounts, order history, reservations, and a single flat delivery charge. This already satisfies most of Petpooja's category B for orders placed directly with the restaurant — no external platform involved. Gaps in this own-channel flow: delivery-zone-based (vs flat) charging, delivery-staff assignment/tracking in the online flow specifically, and live order-tracking for the customer.";

export const DELIVERY_PLATFORMS = {
  cols: ['What was actually found', 'Access model'],
  rows: [
    { label: 'Zomato', vals: ['An official "Zomato POS Integration API" developer portal (zomato.com/developer/integration) documents Menu Management APIs (add/update items, mark out-of-stock) and Order Management APIs (accept/reject/update order status)', 'Sign-up as an integration partner required — typically aimed at established POS vendors, not a self-serve API key. Approval process and any fees are unverified — needs direct confirmation (§16).'] },
    { label: 'Swiggy', vals: ['A public developer portal exists (developers.swiggy.com), but its visible content centers on newer AI-agent/MCP tooling (OAuth 2.1 + PKCE, a "Builders Club" program) — no clearly documented self-serve POS-order-integration API surfaced in this session’s fetch', 'Historically managed as a direct business/partnership relationship rather than a published open API. Unverified whether this has changed — needs direct confirmation (§16).'] },
    { label: 'Uber Eats', vals: ['Not independently fetched in this session; Uber’s developer platform is known generally to require a Marketplace API partnership with approval, similar to Zomato/Swiggy', 'Unverified — needs direct confirmation (§16).'] },
  ],
};

export const DELIVERY_COMMERCIAL_NOTE = "None of these three platforms offer a plain self-serve \"sign up and get an API key\" flow for POS order integration — all three gate it behind a partner/business relationship of some kind. AppZetBilling would need to either (a) become an approved integration partner itself for each platform — a business-development effort with unknown timeline and terms, not a sprint of engineering work, or (b) integrate through an existing aggregator-integration middleware vendor, trading a build effort for a recurring per-order or per-month fee. Recommendation: treat this as Phase 5, and resolve the partnership question with each platform before estimating engineering effort — the adapter code itself is the easy part once API access exists.";

export const DELIVERY_REMAINING_GAPS = "QR-code ordering: Table.qr_code suggests a per-table QR mechanism already exists in the schema; whether it flows through to a pre-filled dine-in checkout wasn't confirmed and is a small, low-risk item to verify/finish rather than build from scratch. Delivery-zone management, delivery charges, delivery staff, order tracking, customer notifications: the flat delivery-charge option is the one piece confirmed built; zone-based pricing, a delivery-staff assignment/status flow in the online-store checkout specifically, live tracking, and automated customer notifications (tied into WhatsApp) are all real gaps, each individually small.";

export const WHATSAPP_SUMMARY = [
  { t: 'Feasible, no rewrite', d: "Each restaurant tenant connects its own WhatsApp number via Meta's Embedded Signup (not a shared AppZetBilling number) — the deciding factor is that Meta pools messaging-limit risk and quality score per Business Portfolio, so a shared number would let one tenant's bad sends throttle every other tenant." },
  { t: "Meta's Cloud API pricing changed to per-message billing on 1 July 2025", d: 'Utility messages (bill delivery, order status, payment confirmation) are free inside a 24-hour customer-service window and charged outside it; marketing messages are always charged with no volume discount. Transactional WhatsApp sends are near-free to the tenant under normal use, marketing broadcasts are not.' },
  { t: 'A real infrastructure gap was found and must be fixed regardless of WhatsApp', d: 'No queue worker (php artisan queue:work) and no scheduler cron (php artisan schedule:run) are running on the production VPS today. Any WhatsApp send — or any of the other queued/scheduled work proposed in this report (payment webhook processing, delivery-platform sync jobs, expiry alerts) — depends on this being fixed first.' },
  { t: "Matches Petpooja's own WhatsApp-adjacent claims", d: 'Bill sharing, order confirmation, payment reminders, and (later) promotional campaigns are all in the already-designed feature roadmap, phased MVP → Phase 2 → Phase 3 the same way this report phases everything else.' },
];

export const WHATSAPP_REFERENCE_NOTE = "See the dedicated WhatsApp Business Module page directly for the full database schema (9 new tables), API design, cost model with a worked example, security/compliance treatment, and a 6-milestone implementation plan — duplicating it here would only get it out of sync with the source analysis.";

export const PAYMENT_EXISTING_NOTE = "BusinessGateway gives every tenant its own gateway credentials, test/live mode, a convenience-charge field, and a manual/offline payment path (bank transfer or a UPI QR image with proof upload) — already close to what Petpooja's own payment flexibility implies, and already backed by Razorpay/Stripe/PayTM/PhonePe/Mollie packages. This is a strong foundation, not a gap.";

export const PAYMENT_GAP_NOTE = "The online-store checkout's payment flow (AcnooCheckoutController::paymentProcess → success/failed) is redirect-based only — no webhook/IPN handler was found for customer order payments (the only payment webhooks found in the repo are for the tenant's own SaaS-subscription billing, a separate flow entirely). A customer whose browser closes or connection drops after paying but before the redirect completes leaves AppZetBilling with no way to learn the payment actually succeeded, other than the customer complaining. Worth fixing before adding new gateways.";

export const PAYMENT_PROVIDERS = [
  { t: 'Razorpay (docs.razorpay.com, fetched)', d: "Payment Links API: create/update/cancel/fetch/resend via API, with a UPI-specific link variant. Redirect callback carries a razorpay_signature that must be verified with HMAC-SHA256 before trusting it. A separate webhook subscription mechanism exists for asynchronous status changes. Multi-merchant/marketplace payment splitting (Razorpay Route) wasn't detailed in what was fetched — unverified, flagged for direct confirmation (§16)." },
  { t: 'Cashfree (cashfree.com/docs, via search)', d: "Payment Links, QR codes, and Virtual UPI IDs for accepting UPI payments without a full checkout integration; webhook signature verification via HMAC-SHA256 over an x-webhook-signature header plus a timestamp header. Important, dated finding: Cashfree is deprecating the UPI Collect flow from 28 February 2026 for most use cases (exemptions apply to specific categories)." },
];

export const PAYMENT_RECOMMENDATION = "Add a PaymentsAddon with a PaymentProviderInterface implemented first for Razorpay (already partially integrated) and Cashfree (net-new), each exposing createPaymentLink(), verifyWebhookSignature(), and refund(). Build the missing webhook-reconciliation path as part of this work, not as an afterthought — it closes a real correctness gap in the existing flow, independent of adding Cashfree.";

export const PAYMENT_MERCHANT_NOTE = "BusinessGateway already isolates credentials per tenant, which covers the practical need in almost every case (each restaurant's payments go to that restaurant's own gateway account). True sub-merchant routing where AppZetBilling itself becomes a payment aggregator (Razorpay Route, Cashfree's marketplace product) is a materially bigger commitment — regulatory (RBI PA/PG authorization territory in India), not just technical — and shouldn't be assumed necessary without confirming what problem it would actually solve that per-tenant credentials don't.";

export const INVENTORY_BUILT_NOTE = "Recipe-based automatic stock deduction on every sale (StockService::processSale, via SaleObserver), stock restoration on purchase (processPurchase, via PurchaseObserver), unit conversion, low-stock reporting infrastructure, ad-hoc wastage recording (damage movement type), and KOT routing to named kitchen stations with cooking/kot status transitions. This is a materially complete recipe-costing and kitchen-routing engine — the roadmap below is about rounding it out, not building it from zero.";

export const INVENTORY_GAPS = [
  { t: 'Batch and expiry tracking', d: "Add batch_no, expiry_date to StockMovement (or a new ingredient_batches table if FIFO/weighted-average costing across batches matters); a scheduled job flags ingredients nearing expiry. Self-contained." },
  { t: 'Stock transfer between branches', d: "A StockTransfer entity recording a paired stock-out at the source branch and stock-in at the destination, reusing StockMovement's existing reference_id/reference_type pattern. Depends only on MultiBranchAddon, already installed." },
  { t: 'Consolidated food-cost reporting', d: "Mostly a new report query over Recipe/RecipeIngredient costs against Sale volume; the underlying data already exists, so this is closer to a ReportsController addition than new infrastructure." },
  { t: 'Kitchen Display System screen', d: "The backend (Kitchen, KotTicket, cooking/kot status API) is confirmed working; whether a literal KDS screen UI exists depends on the separate POS client app not present on this VPS. Verify before scoping as new frontend work." },
  { t: 'Thermal/kitchen printer support', d: 'No server-side driver code was found in this Laravel app; printing most plausibly happens client-side in the POS app already. Flagged for vendor/owner confirmation rather than assumed as a backend gap.' },
];

export const INVENTORY_CLOSING_NOTE = "None of these require new external accounts or partner approvals — unlike delivery and WhatsApp, this entire section is purely internal engineering effort once the POS-client questions are answered.";

export const DB_ENTITIES = {
  cols: ['Purpose', 'Key fields', 'Relationships', 'Tenant isolation', 'Migration complexity'],
  rows: [
    { label: 'integration_connections', vals: ["One row per tenant-provider connection (delivery, payment, messaging) — generalizes the proven BusinessGateway pattern across every integration family", 'provider, credentials_ciphertext, status, branch_id (nullable)', 'business_id → businesses.id', 'business_id NOT NULL, existing scope pattern', 'Low — additive'] },
    { label: 'integration_webhook_events', vals: ['Idempotent inbound event ledger for every provider', 'provider, event_id (unique), payload (json), processed_at', 'none (system-of-record)', 'N/A — references connection_id', 'Low'] },
    { label: 'delivery_zones', vals: ["Per-tenant delivery-area definitions with a charge/distance rule, replacing the current single flat delivery-charge option", 'business_id, branch_id, name, charge_type, charge_value, polygon/radius', 'business_id → businesses.id', 'business_id NOT NULL', 'Low–Medium'] },
    { label: 'delivery_assignments', vals: ['Links a Sale to a delivery staff member and tracks status', 'sale_id, deliveryman_id, status, assigned_at', 'sale_id → sales.id (Sale already has a deliveryman_id column — verify whether this table is even needed)', "Inherits sale's business_id", 'Low'] },
    { label: 'payment_transactions', vals: ['Reconciliation ledger for customer order payments — closes the webhook gap', 'sale_id, gateway, gateway_txn_id, status, amount, webhook_received_at', 'sale_id → sales.id', "Inherits sale's business_id", 'Low–Medium'] },
    { label: 'gift_cards / gift_card_redemptions', vals: ['New capability — issued value, balance, expiry; redemption ledger against a Sale', 'business_id, code (unique per business), balance, expires_at', 'business_id → businesses.id, redemptions → sales.id', 'business_id NOT NULL, composite-unique(business_id, code) — avoid repeating the existing coupons.code global-uniqueness bug flagged elsewhere on this site', 'Low'] },
    { label: 'membership_tiers', vals: ['New capability — tier thresholds and benefit multipliers layered on existing LoyaltyItemCustomer accrual', 'business_id, name, min_points, point_multiplier', 'business_id → businesses.id', 'business_id NOT NULL', 'Low'] },
    { label: 'ingredient_batches (or columns on stock_movements)', vals: ['Batch/expiry tracking', 'ingredient_id, batch_no, expiry_date, quantity', 'ingredient_id → ingredients.id', "Inherits ingredient's business_id", 'Low'] },
    { label: 'stock_transfers', vals: ['Branch-to-branch inventory movement', 'from_branch_id, to_branch_id, ingredient_id, quantity, status', 'business_id → businesses.id, references two branches', 'business_id NOT NULL', 'Low–Medium'] },
    { label: 'campaign_schedules', vals: ['Birthday/segment marketing automation, feeding the WhatsApp/SMS/email adapters', 'business_id, trigger_type, template_ref, status', 'business_id → businesses.id', 'business_id NOT NULL', 'Medium — depends on messaging adapters existing first'] },
  ],
};

export const DB_CLOSING_NOTE = "WhatsApp-specific tables (9 tables: connections, templates, opt-ins, messages, attempts, webhook events, campaigns, campaign recipients, usage counters) are already fully designed on the dedicated WhatsApp Business Module page and not repeated here. Every row above is additive: no existing table's columns are proposed to change, and nothing here has been migrated or executed.";

export const API_ROUTES_CODE = `Route::apiResource('integration-connections', Api\\IntegrationConnectionController::class);
Route::apiResource('delivery-zones', Api\\DeliveryZoneController::class);
Route::apiResource('gift-cards', Api\\GiftCardController::class);
Route::apiResource('membership-tiers', Api\\MembershipTierController::class);
Route::apiResource('stock-transfers', Api\\StockTransferController::class);
Route::post('gift-cards/{code}/redeem', [Api\\GiftCardController::class, 'redeem']);
Route::get('integration-health', [Api\\IntegrationHealthController::class, 'index']);

// Outside auth:sanctum, provider-specific signature middleware:
Route::post('webhooks/payments/{gateway}', [Api\\PaymentWebhookController::class, 'handle']);
Route::post('webhooks/delivery/{provider}', [Api\\DeliveryWebhookController::class, 'handle']);
// WhatsApp webhook already specified on the dedicated WhatsApp Business Module page`;

export const API_CONVENTION_NOTE = "All new endpoints follow the existing routes/api.php convention exactly: Route::prefix('v1')->group(['middleware' => ['auth:sanctum','module','active.branch']], ...), resourceful controllers via Route::apiResource, gated by the same module middleware that already checks moduleCheck() against modules_statuses.json.";

export const API_SERVICES_NOTE = "New services, following the existing pattern of StockService/NotificationService: IntegrationConnectionService (credential encryption/decryption, connection status), PaymentWebhookService (per-gateway signature verification — HMAC-SHA256 for both Razorpay and Cashfree — then reconciling against payment_transactions), DeliverySyncService (menu push + order pull, once/if aggregator access exists), GiftCardService (issue/redeem/balance).";

export const API_JOBS_NOTE = "Every webhook handler writes to integration_webhook_events and returns 200 immediately, then a queued job processes it — the same write-first-process-later pattern already specified for WhatsApp webhooks. This depends on the same queue-worker fix flagged elsewhere (no queue:work process currently runs in production) — it is the single infrastructure item every capability in this report shares, so it belongs in Phase 1, not repeated as a per-feature dependency.";

export const API_IDEMPOTENCY_NOTE = "Idempotency and rate limiting follow the same design already proposed for WhatsApp: an idempotency key per outbound action (e.g. sha256(sale_id:gateway:amount) for a payment charge), and a RateLimiter per integration_connections row sized below each vendor's published limit.";

export const FRONTEND_TABLE = [
  { t: 'Integrations dashboard', d: 'New top-level admin section, alongside existing admin/addons. Lists every connected provider (delivery, payment, WhatsApp) with status from integration_health.' },
  { t: 'Delivery-zone settings', d: 'Under the existing online-store/business settings area, replacing the single flat delivery-charge field. Map or radius-based zone editor.' },
  { t: 'Payment gateway settings', d: "Extends the existing BusinessGateway settings screen — already has a UI pattern to add Cashfree into. Add webhook-status indicator per gateway." },
  { t: 'WhatsApp settings', d: 'Already fully specified on the dedicated WhatsApp Business Module page.' },
  { t: 'Gift cards / membership tiers', d: "New tab under the existing loyalty/coupon settings area. Reuses the Coupon screen's layout conventions." },
  { t: 'Inventory dashboard additions', d: "Batch/expiry and stock-transfer screens added to the existing InventoryAddon views (inventory-items, stocks). Same index/create/edit/datas pattern already used there." },
  { t: 'Kitchen dashboard', d: "Contingent on the POS-client open question — if it already renders a KDS screen, no new admin-panel work is needed; if not, a new screen following AcnooKitchenController's existing data. Verify before scoping." },
  { t: 'Reports', d: 'New report types (food cost, delivery performance, gift-card liability) slot into the existing ReportsController + per-module reports/* view pattern, with PDF/Excel export already standard.' },
  { t: 'Multi-branch management', d: 'Extends existing MultiBranchAddon screens with stock-transfer and per-branch delivery-zone views.' },
  { t: 'Tenant subscription controls', d: 'Extends the existing admin/plans (SaaS-admin) screen — new Plan.available_modules entries per capability, same pattern as every existing add-on.' },
];

export const FRONTEND_NOTE = "All of this extends the existing Blade + Alpine.js admin panel and its per-module resources/views/{module}/{screen}/{index,create,edit,datas,pdf,excel-csv}.blade.php convention already used consistently across InventoryAddon, CashRegisterAddon, HrmAddon, RestaurantOnlineStore — no new frontend framework, no parallel dashboard.";

export const SECURITY_ITEMS = [
  { t: 'Tenant isolation', d: 'Every new table carries business_id and uses the same global-scope pattern already proven on Sale/Party/Table; no hand-rolled where(‘business_id’, ...) in new controllers.' },
  { t: 'Credential storage', d: "integration_connections.credentials_ciphertext via Laravel's encrypted cast, same treatment already specified for WhatsApp tokens — never plaintext, never logged, never returned by any API response." },
  { t: 'Webhook signature verification is mandatory before parsing', d: "For every provider: Razorpay's HMAC-SHA256 razorpay_signature, Cashfree's HMAC-SHA256 x-webhook-signature + timestamp, and delivery-platform webhooks once/if that access exists — verified first, every time, no exceptions." },
  { t: 'PCI/RBI scope', d: 'AppZetBilling does not need to touch card data directly as long as gateways are used via their hosted checkout/payment-link flows (as BusinessGateway already does); true sub-merchant aggregation would pull AppZetBilling into RBI Payment Aggregator regulatory scope in India and should not be pursued without legal review.' },
  { t: 'Gift card / loyalty balances are financial liabilities', d: 'Treat gift_cards.balance with the same care as Sale.dueAmount; redemption must be atomic (a database transaction, not a read-then-write) to prevent double-spending.' },
  { t: 'Delivery-platform data sharing', d: 'If/when Zomato/Swiggy integration happens, customer contact details flowing between platforms need an explicit data-sharing basis, not just "the order came through" — confirm with each platform’s own data-processing terms before building.' },
  { t: 'Consent', d: 'Marketing use of loyalty/customer data (birthday offers, campaigns) needs the same opt-in/opt-out discipline already specified for WhatsApp marketing messages — one consistent consent model, not two.' },
  { t: 'Audit logging', d: 'Every connect/disconnect/credential-rotation event on integration_connections, and every payment-webhook signature failure, logged without ever including the secret/signature value itself.' },
  { t: 'Inherited infra gaps', d: 'The missing queue worker/scheduler and LOG_LEVEL=debug in production (noted on the WhatsApp Business Module page) apply to every new integration’s logging and background processing exactly as they do to WhatsApp — fix once, benefit everywhere.' },
];

export const MONETIZATION_TABLE = [
  { t: 'Basic', d: 'Core POS, KOT/kitchen routing, cash register, basic inventory — all already built. (Existing)' },
  { t: 'Professional', d: 'Online ordering storefront, coupons, basic loyalty, reservations — also already built. (Existing)' },
  { t: 'Enterprise', d: 'Multi-branch, HRM, advanced reports — also already built. (Existing)' },
  { t: 'Online ordering add-on', d: 'Delivery-zone management, order-payment webhook reconciliation. (New)' },
  { t: 'WhatsApp messaging', d: 'Message credits, per the cost model already designed on the WhatsApp Business Module page. (New, already scoped)' },
  { t: 'Delivery management add-on', d: 'Delivery-zone + delivery-staff assignment; aggregator integration as a separate, higher tier once partner access exists. (New)' },
  { t: 'Advanced inventory add-on', d: 'Batch/expiry, stock transfers, food-cost reporting. (New)' },
  { t: 'Multi-branch support', d: 'Already exists as MultiBranchAddon — just extend its limits to cover new per-branch features. (Existing, extended)' },
  { t: 'Premium reports', d: 'Food cost, delivery performance, gift-card liability reports. (New)' },
  { t: 'Loyalty/marketing add-on', d: 'Gift cards, membership tiers, campaign automation. (New)' },
];

export const MONETIZATION_BASIS_NOTE = "Builds on the Plan/PlanSubscribe/PlanLimitService/available_modules mechanism already in production — the same system that gates InventoryAddon, MultiBranchAddon, etc. today. No new billing engine needed; new capabilities are new available_modules entries and new Plan limit fields, exactly like the existing add-ons.";

export const PRICING_NOTE = "On vendor pricing: no vendor pricing is invented here. Petpooja does not publish self-serve pricing (commercial terms require contacting their sales team, confirmed by the absence of a public pricing page across every source checked); Razorpay/Cashfree per-transaction fees are published on their own sites but weren't line-item-verified in this session and should be pulled directly from their pricing pages before quoting a number to a tenant; Meta's WhatsApp per-message rates are already sourced with dates on the WhatsApp Business Module page.";

export const COST_CATEGORIES_NOTE = "Cost categories to budget, without specific numbers: development effort per phase, per-message WhatsApp/SMS costs (usage-based, passed through or margined per the existing WhatsApp analysis's Model C), per-transaction payment gateway fees (usage-based, typically absorbed into BusinessGateway.charge already), and any delivery-platform integration fee or middleware-vendor fee (entirely commercial-terms-dependent and unverified).";

export const PHASES = [
  {
    n: '1', t: 'Improve existing POS and restaurant operations',
    features: 'Fix the queue-worker/scheduler gap (shared prerequisite for every later phase); verify/finish QR-code-per-table → dine-in checkout linkage; verify the KDS-screen and thermal-printer questions with the POS client owner; fix the invoice-numbering race condition flagged elsewhere on this site.',
    backend: 'A Supervisor/systemd queue:work unit + a schedule:run cron entry; small checkout-controller changes if the QR link needs finishing.',
    frontend: 'None required unless the QR link needs a new query param handled client-side.',
    database: 'None.',
    dependencies: 'None — this phase unblocks every later one.',
    effort: 'Small — hours for the infra fix, days for verification once the POS client owner is available.',
    risks: 'None of substance; the main risk is skipping this phase and having every later phase’s background jobs silently fail.',
    testing: 'Confirm a manually-dispatched job actually processes; confirm the scheduler fires.',
    revenue: 'Indirect — this is reliability work, not a sellable feature on its own.',
  },
  {
    n: '2', t: 'Online ordering, QR ordering, and payment integrations',
    features: 'Delivery-zone management, delivery-staff assignment flow, payment-webhook reconciliation, Cashfree adapter alongside the existing Razorpay/Stripe/etc.',
    backend: 'IntegrationsCore + PaymentsAddon modules, PaymentWebhookController, DeliveryZoneController.',
    frontend: 'Delivery-zone settings screen, payment-gateway settings extension.',
    database: 'integration_connections, integration_webhook_events, delivery_zones, payment_transactions.',
    dependencies: "Phase 1's queue fix.",
    effort: 'Medium — several weeks, mostly backend; no external partner approval needed (Razorpay/Cashfree are self-serve merchant accounts, unlike Phase 5’s aggregators).',
    risks: 'Getting webhook signature verification wrong is a real security risk, not just a bug — test it explicitly.',
    testing: 'Webhook signature validity/invalidity, duplicate webhook delivery, delivery-zone charge calculation edge cases.',
    revenue: 'An "online ordering add-on" tier and reduced payment-reconciliation support burden.',
  },
  {
    n: '3', t: 'WhatsApp, customer loyalty, and marketing',
    features: 'The WhatsApp MVP already fully scoped on its dedicated page (bill PDF, payment confirmation); gift cards; membership tiers; birthday/segment campaign automation.',
    backend: 'WhatsAppAddon (already designed), LoyaltyAddon (GiftCardService, tier logic), campaign_schedules processing job.',
    frontend: 'WhatsApp settings (already designed), gift-card/membership screens.',
    database: "WhatsApp's 9 tables (already designed) + gift_cards, gift_card_redemptions, membership_tiers, campaign_schedules.",
    dependencies: "Phase 1 (queue), Meta Business Verification for WhatsApp (2–14 business days) sitting on the critical path.",
    effort: 'Medium–large — WhatsApp alone is already scoped as weeks; loyalty/gift-card work is additive on top.',
    risks: "WhatsApp template miscategorization risk (already documented on its page); gift-card balance race conditions if redemption isn't transactional.",
    testing: "Per the WhatsApp page's own test plan; gift-card double-redemption test specifically.",
    revenue: 'WhatsApp message-credit add-on (already modeled) and a loyalty/marketing add-on tier.',
  },
  {
    n: '4', t: 'Advanced inventory, kitchen management, and reports',
    features: 'Batch/expiry tracking, stock transfers, consolidated food-cost reporting, KDS-screen work if Phase 1’s verification found it’s genuinely missing.',
    backend: 'Extensions to the existing InventoryAddon (StockService, new models) — not a new module, since the addon and its stock-deduction engine already exist.',
    frontend: 'New screens inside the existing InventoryAddon view conventions.',
    database: 'ingredient_batches, stock_transfers.',
    dependencies: 'MultiBranchAddon (already installed) for stock transfers.',
    effort: 'Small–medium — the most self-contained phase, building on an already-solid engine.',
    risks: 'Low — no external dependencies.',
    testing: 'Batch-expiry alert timing, stock-transfer double-entry correctness (matching in/out amounts across branches).',
    revenue: 'An "advanced inventory" add-on tier and a premium-reports tier.',
  },
  {
    n: '5', t: 'External delivery-platform integrations and enterprise capabilities',
    features: 'Zomato/Swiggy/Uber Eats order aggregation, sub-merchant payment routing if a real need for it is confirmed.',
    backend: 'DeliveryAddon adapters — but only once partner API access is actually secured; the adapter code itself is the easy part.',
    frontend: 'Aggregator connection status inside the Integrations dashboard.',
    database: 'Delivery-specific fields on integration_connections.',
    dependencies: 'Business-development approval from each delivery platform, of unknown timeline — this is the phase’s actual critical path, not engineering.',
    effort: "Unknown until partner terms are confirmed — do not commit a date before the open vendor questions are answered.",
    risks: "The highest in this report — commercial terms, approval timeline, and ongoing API stability are all outside AppZetBilling's control.",
    testing: 'Per-platform sandbox environments, once access exists.',
    revenue: "Potentially the largest (delivery-platform order volume is often the majority of a restaurant's online orders in India) but also the least certain to estimate today.",
  },
];

export const TECHNICAL_RISKS = [
  { t: 'The queue/scheduler gap is the single biggest shared risk', d: "Every capability in this report (payment webhooks, delivery sync, expiry alerts, WhatsApp) depends on background jobs actually running, and today they don't, confirmed live on the VPS. Building on top of this without fixing it first means features that appear to work in testing silently fail in production." },
  { t: 'Payment webhook signature verification, done wrong, is a security hole, not a bug', d: 'An unverified webhook endpoint lets anyone POST a fake "payment succeeded" event. Both Razorpay and Cashfree require HMAC-SHA256 verification; skipping it to ship faster is not an acceptable shortcut.' },
  { t: "Delivery-platform partnership risk is entirely outside engineering's control", d: 'Zomato/Swiggy/Uber Eats integration depends on business-development approval with unknown timeline and terms; scoping Phase 5 with an engineering estimate alone would understate the real risk.' },
  { t: 'The unconfirmed POS client', d: 'Several capabilities (bill screen, KDS screen, thermal printing) may already exist in a separate client app not present on this VPS, or may not exist anywhere. Estimating frontend effort without first getting that repo/answer risks either duplicate work or a missed dependency.' },
  { t: 'Gift-card and loyalty balance correctness', d: 'These are real financial liabilities; a non-atomic redemption path is a data-integrity risk, not just a UX bug.' },
  { t: 'RBI Payment Aggregator scope creep', d: "Pursuing true sub-merchant payment routing without confirming it's actually needed risks pulling AppZetBilling into a materially heavier regulatory category than its current per-tenant-credential model requires." },
  { t: 'The existing coupons.code global-uniqueness issue would repeat itself', d: "In gift_cards.code if not deliberately designed as tenant-scoped-unique from the start — an easy mistake to avoid now, expensive to fix once live." },
  { t: 'Template/message-category misclassification cost risk', d: 'Already documented in detail on the WhatsApp Business Module page; applies to any future SMS/email marketing automation by the same logic — a poorly worded transactional message can be reclassified as marketing and change its cost basis unexpectedly.' },
];

export const VENDOR_QUESTIONS = [
  { t: 'Zomato', d: "What's the actual approval process, timeline, and any fee to become an integration partner on zomato.com/developer/integration? Is it open to a POS vendor at AppZetBilling's current scale?" },
  { t: 'Swiggy', d: 'Does developers.swiggy.com offer any self-serve path for POS order integration today, or is that still exclusively a business-development relationship?' },
  { t: 'Uber Eats', d: "Not researched directly — what does Uber's Marketplace API partnership process require for a POS integration, and what's the realistic timeline?" },
  { t: 'Razorpay', d: 'Does Razorpay Route (or an equivalent) actually fit "separate merchant account per tenant", and does adopting it change AppZetBilling’s own regulatory classification in India?' },
  { t: 'Cashfree', d: "Confirm the 28 February 2026 UPI Collect deprecation doesn't affect any existing AppZetBilling payment flow before that date, and clarify Cashfree's own sub-merchant/marketplace product terms." },
  { t: 'Petpooja pricing', d: 'Since no self-serve pricing is published, is there value in formally requesting a quote purely for competitive-positioning research, or is that not worth pursuing?' },
  { t: 'The POS client app', d: 'Who owns that repo, what’s its stack, and does it already implement the bill screen, KDS screen, and thermal printing referenced throughout this report? This single answer resolves several "unconfirmed" items at once.' },
  { t: 'Delivery-zone and delivery-staff requirements', d: 'Does AppZetBilling want distance-based, polygon-based, or simple named-zone pricing — this changes the schema and the admin UI meaningfully.' },
];

export const NEXT_STEPS = [
  { t: 'Fix the queue-worker/scheduler gap (Phase 1)', d: 'Zero-cost, unblocks every other phase, and is already independently overdue per the WhatsApp Business Module analysis.' },
  { t: 'Get the POS client question answered', d: 'A single conversation with whoever owns that repo resolves the bill-screen, KDS-screen, and printer questions that currently sit as "unconfirmed" across this report.' },
  { t: 'Start Phase 2 (payment webhooks + Cashfree) before Phase 3 (WhatsApp)', d: "It closes a real, already-existing correctness gap and doesn't wait on Meta's business-verification timeline the way WhatsApp does; the two can also run in parallel if resourcing allows." },
  { t: 'Open the Zomato/Swiggy/Uber Eats partnership conversations now, in parallel with engineering work, not after', d: 'This is a business-development timeline, not a sprint — starting it early prevents Phase 5 from being blocked purely on paperwork once the engineering catches up.' },
  { t: "Don't build gift cards/membership tiers/campaign automation until the WhatsApp/SMS messaging adapters exist (Phase 3)", d: "Marketing automation without a messaging channel to act through isn't shippable on its own." },
  { t: 'Revisit sub-merchant payment routing only if a concrete business reason surfaces', d: "Don't build toward Razorpay Route/Cashfree marketplace products speculatively; the existing BusinessGateway per-tenant-credential model already covers the practical need in almost every case." },
  { t: 'Treat this report and the WhatsApp Business Module page as one connected plan, not two separate ones', d: 'Both share the same infrastructure prerequisite and the same integration-architecture pattern — build the shared IntegrationsCore module once, and let both WhatsApp and the new payment/delivery adapters sit on top of it.' },
];

export const FILES_INSPECTED_NOTE = "app/Models/* (Sale, Party, Table, Kitchen, Coupon, LoyaltyItem, BusinessGateway, and the rest); app/Http/Controllers/Api/* and Admin/* (full listing captured); routes/api.php, routes/web.php; Modules/InventoryAddon (StockService, SaleObserver, PurchaseObserver, Recipe/RecipeIngredient, StockMovement, full controller/view tree); Modules/RestaurantOnlineStore (full controller/view tree — checkout, cart, customer account, reservations); Modules/CashRegisterAddon (full controller/view tree); Modules/HrmAddon (model/controller listing); app/Http/Controllers/PaymentController.php; composer.json. All read-only; nothing modified, restarted, or deployed.";

export const ASSUMPTIONS = [
  { t: "Petpooja's feature set", d: "Benchmarked from secondary sources plus general market knowledge, not a primary product walkthrough or its own API documentation (which isn't public)." },
  { t: "AppZetBilling's own online-ordering channel already covers most of Petpooja's category B", d: "Assumes the storefront found in RestaurantOnlineStore is actually live/enabled for tenants today, not merely present in the codebase — not independently confirmed by checking a live tenant's site." },
  { t: 'Effort estimates', d: 'Assume one small team working sequentially by phase, not parallelized across a larger team — actual timelines will compress or extend accordingly.' },
];

export const UNVERIFIED_CLAIMS = [
  "Petpooja's exact KDS/offline-billing/hardware mechanics.",
  "Whether AppZetBilling's Table.qr_code actually flows into a dine-in checkout today.",
  "Zomato's exact partner-approval process/timeline/fees; Swiggy's current self-serve API availability for POS integration; Uber Eats' equivalent — all flagged for direct vendor confirmation.",
  "Razorpay Route's fit for \"separate merchant account per tenant\".",
  "Whether a separate POS client app exists, and what it already implements.",
  "The direct fetch of petpooja.com's homepage in this session returned content inconsistent with Petpooja's known positioning and was not relied on — the benchmark is built from independent review sources and search results instead.",
];

export const SOURCES = [
  { t: 'Zomato Developer Platform', u: 'https://www.zomato.com/developer/integration/', d: 'Menu Management and Order Management APIs exist; partner sign-up required (via search, direct fetch timed out).' },
  { t: 'Swiggy Developer Portal', u: 'https://developers.swiggy.com/', d: 'Exists publicly; direct fetch returned only a loading shell, so its actual current POS-integration offering (if any) is unconfirmed.' },
  { t: 'Razorpay Docs — Payment Links APIs', u: 'https://razorpay.com/docs/payments/payment-links/apis/', d: 'Fetched; Payment Links API, UPI link variant, razorpay_signature HMAC-SHA256 verification, webhook subscription.' },
  { t: 'Cashfree API Reference', u: 'https://www.cashfree.com/docs/api-reference/payments/latest/overview', d: 'Via search; Payment Links/QR/Virtual UPI IDs, x-webhook-signature HMAC-SHA256 verification, UPI Collect deprecation effective 28 February 2026.' },
  { t: 'Independent Petpooja review/comparison sources (Capterra, SoftwareAdvice, SelectHub, SoftwareSuggest, Techjockey)', u: 'https://www.capterra.com/p/172163/Petpooja-Restaurant-Management-Platform/', d: 'Via search; feature-category descriptions used in the benchmark, explicitly not treated as primary/verified technical documentation.' },
];
