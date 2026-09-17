// WhatsApp Business Module — feasibility analysis and implementation roadmap. Built from a live,
// read-only SSH inspection of the production VPS (2026-09-18) plus official Meta developer-docs
// research (pricing, Embedded Signup, messaging limits — see SOURCES for exact pages/dates).
// No production code, migrations, or dependencies were touched to produce this — see MILESTONES
// for the actual build order, none of which has been implemented yet.

export const STATS = [
  { k: 'Recommended architecture', v: 'Option B' },
  { k: 'New DB tables proposed', v: '9' },
  { k: 'Implementation milestones', v: '6' },
  { k: 'Blocking infra gap found', v: '1' },
];

export const STACK_FACTS = [
  { k: 'Backend', v: 'Laravel 10.10, PHP ^8.1 required — the live PHP-FPM pool is bound to PHP 8.2, not the 8.4 CLI default (CloudPanel runs 7 PHP versions side by side)' },
  { k: 'Modularity', v: 'nwidart/laravel-modules 10.0.6 — 7 paid add-ons already ship this way: RestaurantWebAddon, CustomDomainAddon, RestaurantOnlineStore, HrmAddon, CashRegisterAddon, InventoryAddon, MultiBranchAddon' },
  { k: 'Database', v: 'MySQL (Percona Server), single shared schema appzetsbilling — no database-per-tenant' },
  { k: 'Cache', v: 'Redis, CACHE_DRIVER=redis — not used for queues' },
  { k: 'Queue', v: 'QUEUE_CONNECTION=database (jobs/failed_jobs tables) — no Redis, RabbitMQ or Kafka in use anywhere' },
  { k: 'Auth', v: 'Laravel Sanctum (API tokens) + spatie/laravel-permission roles, plus a second custom `visibility` JSON permission matrix on User — two permission systems coexist' },
  { k: 'PDF', v: 'barryvdh/laravel-dompdf ^3.0 is a dependency, but only used today for SaaS-level admin invoices — not the restaurant’s own customer bill' },
  { k: 'Push notifications', v: 'kreait/laravel-firebase via NotificationService::sendPushNotification(), dispatched by SendPushNotificationJob (ShouldQueue)' },
  { k: 'Email', v: 'SMTP via Brevo; mailables in app/Mail (SendMail, RegistrationMail, WelcomeMail, PasswordReset)' },
  { k: 'Payments', v: 'Razorpay, PayTM, PhonePe, Stripe, Mollie, Omnipay — India-first gateway mix' },
  { k: 'Object storage', v: 'None configured. FILESYSTEM_DISK=public, AWS/S3-style env vars are blank — everything lands on local disk' },
  { k: 'SMS / WhatsApp', v: 'Nothing exists today — a repo-wide grep -ri whatsapp returns zero matches outside vendor/' },
];

export const TENANT_MODEL = [
  { t: 'No separate database per tenant', d: 'No stancl/tenancy-style package. Isolation is entirely row-level, enforced by Eloquent global scopes.' },
  { t: 'Business is the tenant', d: 'app/Models/Business.php — one row per restaurant (companyName, slug, plan_subscribe_id, status).' },
  { t: 'User.business_id links every account to a Business', d: '`role` (string) plus the `visibility` JSON drive permissions; Spatie’s HasRoles is also mixed in.' },
  { t: 'MultiBranchAddon adds a second scoping layer', d: 'Sale, Party and DueCollect all carry both business_id and branch_id, enforced by App\\Models\\Scopes\\DataManager and App\\Models\\Scopes\\BranchScope in each model’s booted(). A WhatsApp module reuses this exact pattern rather than inventing a new one.' },
];

export const BILL_PATH = [
  { t: 'Sale is the bill/invoice record', d: 'app/Models/Sale.php — invoiceNumber, totalAmount, paidAmount, dueAmount, party_id (customer), payment_type_id, business_gateway_id, plus a meta JSON blob. Line items live in SaleDetails.' },
  { t: 'Created by AcnooSaleController::store()', d: 'app/Http/Controllers/Api/AcnooSaleController.php:69.' },
  { t: 'Invoice numbers are not concurrency-safe', d: 'AcnooInvoiceController::newInvoice() (app/Http/Controllers/Api/AcnooInvoiceController.php:34) mints numbers as a plain count() + 1 per business. Two simultaneous sales on a busy tenant can race for the same number — worth fixing regardless of WhatsApp, since it also undermines the idempotency keys proposed in §06.' },
  { t: 'No server-side PDF of the actual customer receipt exists', d: 'The Api/ controller naming (AcnooSaleController, AcnooInvoiceController, AcnooNotificationController) and a dedicated PosAppInterface model both point to this Laravel app being the backend for a separate POS client app (mobile/desktop, not present in this repo or on this VPS) that currently renders/prints the receipt itself. Sending "the bill PDF" over WhatsApp means building the first server-side renderer, not reusing an existing one.' },
];

export const CUSTOMER_CONTACT = [
  { t: 'Party is the customer/supplier model', d: 'app/Models/Party.php, type = ‘customer’ vs ‘supplier’. Fields: name, email, phone, address, business_id, branch_id, due, opening_balance.' },
  { t: 'phone has no structure or consent today', d: 'A plain unvalidated string column — no E.164/country-code normalization, no consent flag of any kind. A WhatsApp opt-in/opt-out column has nowhere to live yet.' },
];

export const NOTIFICATION_FACTS = [
  { t: 'Firebase push only', d: 'App\\Services\\NotificationService (FCM), App\\Notifications\\SendNotification (database channel, not email/SMS), Admin\\NotificationController / Api\\AcnooNotificationController.' },
  { t: 'No SMS gateway integrated anywhere', d: 'This is genuinely a first-of-its-kind integration for the app, not an extension of an existing multi-channel notifier.' },
];

export const PLAN_LIMIT_FACTS = [
  { t: 'Plan defines per-plan limits', d: 'app/Models/Plan.php — user_limit, customer_limit, product_limit, branch_limit, available_modules (json), features (json).' },
  { t: 'PlanSubscribe links a Business to a Plan', d: 'App\\Services\\PlanLimitService::check() enforces limits at model-creation time.' },
  { t: 'moduleCheck() already gates every paid add-on', d: 'Used throughout (e.g. Business::domain(), Business::publicQrUrl()) against modules_statuses.json. A WhatsApp module should ship as Modules/WhatsAppAddon, gated the same way, with a new whatsapp_* limit field on Plan for message-credit metering — an existing, working pattern, not something to invent.' },
];

export const API_CONVENTIONS = [
  { t: 'routes/api.php v1 convention', d: "Route::prefix('v1')->group(['middleware' => ['auth:sanctum','module','active.branch']], ...), resourceful controllers via Route::apiResource. New WhatsApp endpoints belong in this same group." },
  { t: 'No webhook route exists anywhere in the app today', d: "grep -i webhook routes/*.php returns no matches. WhatsApp's inbound webhook is the first one this codebase will handle — nothing to copy for signature verification, it has to be built from scratch." },
];

export const VPS_FACTS = [
  { k: 'Server', v: 'Hostinger VPS srv1772946, 203.0.113.10, CloudPanel' },
  { k: 'OS', v: 'Ubuntu 24.04.4 LTS' },
  { k: 'CPU / RAM', v: '2 vCPU · 7.8GB RAM (5.7GB available)' },
  { k: 'Disk', v: '96GB total, 87GB free (10% used)' },
  { k: 'Web/SSL', v: 'Nginx + Let’s Encrypt/certbot via CloudPanel' },
  { k: 'Backups', v: 'Nightly mysqldump pushed to Cloudflare R2 (confirmed running, /etc/cron.d/r2-backup-push), currently unencrypted' },
];

export const WHATSAPP_PRICING = [
  { t: 'Per-message pricing since 1 July 2025', d: 'Meta charges per delivered template message, not per 24-hour conversation. Platform access itself is free.' },
  { t: 'Marketing templates: charged every time', d: 'No free tier, no volume discount — even inside an otherwise-open service window.' },
  { t: 'Utility templates: free inside the 24h Customer Service Window', d: 'Opened whenever the end user messages the business first; charged outside it.' },
  { t: 'Authentication templates (OTP): market-specific rates', d: 'Content is restricted — no URLs, media or emoji, and must use the built-in OTP button (copy-code or one-tap). Irrelevant to bill-delivery; only matters for a future login/verification flow.' },
  { t: 'Service messages: always free', d: 'Free-form replies (not templates) inside the 24-hour window.' },
  { t: 'Volume tiers reset monthly, aggregated per Business Portfolio', d: 'Utility/authentication rates step down after monthly delivered volume crosses thresholds — aggregated across every WABA inside one portfolio. Marketing has no discount at any volume.' },
  { t: 'India: INR billing from 1 Jan 2026', d: 'Existing WABAs must migrate by 31 Dec 2026 — directly relevant, since AppZetBilling’s own gateway mix (Razorpay/PayTM/PhonePe) says its tenant base is India-heavy.' },
];

export const MESSAGING_LIMITS_NOTE = "Since October 2025, a business's daily messaging limit is shared per Business Portfolio across every phone number inside it, not per number. Limits start low for an unverified portfolio (around 250 conversations/24h) and step up (→ 1K → 10K → 100K → unlimited) based on message quality and volume, re-evaluated roughly every 6 hours. One shared, low-quality sender inside a portfolio can throttle every other number in that same portfolio — the single fact that decides the architecture question in §03.";

export const EMBEDDED_SIGNUP_FACTS = [
  { t: "The tenant connects their own number", d: 'An OAuth-style flow: the tenant authenticates with their own Facebook/Meta Business login, creates or selects their own Business Portfolio and WhatsApp Business Account (WABA), verifies their own phone number, and sets a display name — inside a widget AppZetBilling embeds.' },
  { t: 'AppZetBilling never sees the tenant’s Meta credentials', d: 'The flow hands back the tenant’s WABA ID, phone-number ID, and a one-time code; AppZetBilling’s server exchanges that code server-to-server for a customer-scoped business access token.' },
  { t: 'Requires a registered Meta app', d: "A Meta 'Business' type app with whatsapp_business_management and whatsapp_business_messaging permissions, implementing Meta's Embedded Signup Integration Helper widget." },
  { t: 'Onboarding cap: 10/week by default, 200/week once verified', d: '10 new tenant businesses per rolling 7 days by default, rising to 200/7 days once AppZetBilling completes Business Verification + App Review + Access Verification. Beyond 200/week requires applying to become a Meta Business Partner — plan for this before any real marketing push.' },
  { t: 'The tenant’s own Meta account holds the payment method', d: 'Standard ISV model. AppZetBilling can still invoice on top — a business decision layered on top of this, not a technical constraint (§10).' },
];

export const TEMPLATE_RULES_NOTE = "Categories (marketing / utility / authentication) were fixed in June 2023 and remain the classification today. Every outbound template goes through Meta's approval queue; if Meta reclassifies a template after the fact it fires a template_category_update webhook. Authentication templates cannot carry a bill link, PDF, image, or emoji — they exist only for OTP-style codes.";

export const WEBHOOK_MEDIA_NOTE = "All inbound customer replies and all outbound delivery-status events (sent/delivered/read/failed) arrive exclusively via webhook — there is no polling status API. Documents (the bill PDF) are supported up to 100MB, irrelevant in practice since a bill PDF is a few hundred KB; a document must be uploaded to Meta's Media endpoint (or referenced by a public HTTPS URL) before it can be attached to a message.";

export const ARCHITECTURE_TABLE = {
  cols: ['A — Central WABA', 'B — Tenant-owned WABA', 'C — Third-party BSP'],
  rows: [
    { label: 'What it is', vals: ['AppZetBilling owns one WABA, all tenants share it', 'Each tenant connects its own number via Embedded Signup', 'Twilio, Gupshup, 360dialog, etc. on top of Cloud API'] },
    { label: 'Each restaurant keeps its own number', vals: ['No — bills appear to come from one shared AppZetBilling number', 'Yes — the restaurant’s own number and display name', 'Usually yes, one WABA per client under the BSP'] },
    { label: 'Messaging-limit blast radius', vals: ['All tenants share one portfolio’s daily limit and quality score — one abusive tenant throttles everyone', 'Isolated per tenant', 'Isolated per tenant if the BSP provisions a WABA per client'] },
    { label: 'Onboarding complexity', vals: ['Low for the tenant, high ongoing risk for AppZetBilling', 'Medium — Embedded Signup widget, tenant needs a Meta Business account', 'Low–medium — BSP dashboard, tenant still supplies a number'] },
    { label: 'Who pays Meta', vals: ['AppZetBilling, centrally', 'The tenant’s own Meta Business account (§10)', 'The BSP, who bills AppZetBilling with a markup'] },
    { label: 'Credential custody', vals: ['One long-lived system-user token for everyone', 'One customer-scoped token per tenant (§11)', 'BSP holds Meta-side tokens; AppZetBilling holds BSP API keys'] },
    { label: 'Scaling to 1,000+ restaurants', vals: ['Fragile — shared quality score degrades the whole platform', 'Scales cleanly — each tenant’s ceiling is independent', 'Scales, but adds a recurring per-message BSP margin'] },
    { label: 'Onboarding throughput cap', vals: ['Not applicable', '10/week default, 200/week once verified (§02)', 'BSP-dependent, usually higher out of the box'] },
    { label: 'Verdict', vals: ['not recommended', 'recommended — MVP default', 'revisit only if onboarding becomes the bottleneck'], sevs: ['crit', 'ok', 'warn'] },
  ],
};

export const ARCH_DIAGRAM = `flowchart TD
    subgraph Tenant["Restaurant tenant (Business)"]
        Owner["Owner/staff — admin panel"]
        Meta["Tenant's own Meta Business Portfolio + WABA<br/>(connected via Embedded Signup)"]
    end

    Owner -->|"Connect WhatsApp"| Signup["Embedded Signup widget"]
    Signup -->|"one-time code"| Backend

    subgraph Backend["AppZetBilling Laravel app"]
        API["routes/api.php v1<br/>(auth:sanctum, module, active.branch)"]
        Svc["WhatsAppService (provider-agnostic)"]
        Queue["jobs table + queue:work<br/>(NEW — see §09)"]
        Hook["/webhooks/whatsapp<br/>(NEW, signature-verified)"]
        DB[("MySQL: whatsapp_connections,<br/>templates, messages, opt_ins")]
    end

    API --> Svc --> Queue -->|"send template"| CloudAPI["Meta WhatsApp Cloud API"]
    CloudAPI -->|"delivery status +<br/>inbound replies"| Hook --> DB
    Svc --> DB
    CloudAPI -->|"messages"| Customer["Restaurant's customer<br/>(bill PDF / payment confirmation)"]
    Sale["Sale created<br/>(AcnooSaleController::store)"] -->|"dispatch job"| Queue`;

export const MVP_FEATURES = {
  cols: ['Category', 'Opt-in needed?', 'Notes'],
  rows: [
    { label: 'Send bill PDF after Sale is created', vals: ['Utility template', 'Yes, one-time', 'New dompdf render of Sale+SaleDetails; free inside a 24h CSW, otherwise charged at utility rates'] },
    { label: 'Send secure bill link', vals: ['Utility template', 'Yes', 'Reuses the Business::publicQrUrl() signed-link pattern already in the codebase — safer than a PDF for very large orders'] },
    { label: 'Payment confirmation', vals: ['Utility template', 'Yes', 'Triggered from existing payment-gateway callback handlers (Razorpay/Stripe/etc.), which already exist'] },
    { label: 'Pending payment reminder', vals: ['Utility if follow-up; risks becoming Marketing if unprompted', 'Yes', 'Reuses DueCollect / Party::dueForBranch() — needs careful template wording to stay Utility'] },
    { label: 'Order/bill cancellation notice', vals: ['Utility template', 'Yes', 'Hooks into Sale::update()/destroy()'] },
  ],
};

export const PHASE2_FEATURES = {
  cols: ['Category', 'Notes'],
  rows: [
    { label: 'Order confirmation / order status update', vals: ['Utility', 'Relevant once RestaurantOnlineStore orders are in play, not just POS Sales'] },
    { label: 'Customer receipt vs. bill, as distinct templates', vals: ['Utility', 'Two templates, same underlying Sale data'] },
    { label: 'Refund notification', vals: ['Utility', 'Needs a Sale refund/void code path first — not obviously present today, verify before committing to a date'] },
    { label: 'Tax invoice delivery', vals: ['Utility', 'Same renderer as the bill PDF, different copy for GST/VAT-registered tenants (Business.vat_no, Tax model)'] },
    { label: 'Credit/outstanding balance reminder', vals: ['Utility, careful wording', 'Same caveat as the MVP due reminder'] },
    { label: 'Basic incoming-message handling (opt-out keywords, reply log)', vals: ['Service (free-form, inside CSW)', 'Required by policy regardless of features — doesn’t need a full inbox UI yet, just a messages table + an unread-replies list'] },
    { label: 'Daily sales summary to restaurant owner', vals: ['Utility (owner-facing, not customer-facing)', 'Lower risk than customer-facing messages, a good early Phase 2 win'] },
  ],
};

export const PHASE3_FEATURES = [
  { t: 'Shared team inbox', d: 'Conversation history, staff assignment, quick replies, unread counts. Do not build for MVP — it’s a real product surface layered on top of the messages table; postpone until Phase 2’s message log proves the pipeline is reliable.' },
  { t: 'Marketing campaigns', d: 'Broadcasts, festival/birthday offers, coupon distribution, re-engagement. Requires its own opt-in (separate from transactional consent under Meta policy) and template approval per campaign type. Marketing templates have no free window and no volume discount (§02) — don’t ship this until the usage/cost dashboard (§10) exists.' },
  { t: 'Multi-number per tenant', d: 'Per-branch WhatsApp numbers, tied to MultiBranchAddon.' },
  { t: 'AI-assisted replies / campaign copy, loyalty/membership notifications, Google-review requests, order-tracking links', d: 'Real but genuinely optional — each is a small template + a trigger point. Sequence after the inbox exists, since most depend on a working conversation view to be useful.' },
];

export const CODEBASE_IMPACT = {
  cols: ['Existing module touched', 'Backend changes', 'Frontend changes', 'Database changes', 'Infra changes', 'Risk'],
  rows: [
    { label: 'Connect WhatsApp (Embedded Signup)', vals: ['New Modules/WhatsAppAddon, gated via moduleCheck()', 'New WhatsAppConnectionController; OAuth code-exchange call to Meta', 'New "WhatsApp" tab under admin business settings', 'New whatsapp_connections table', 'Meta app registration (one-time)', 'Medium — first OAuth-style integration in the codebase'] },
    { label: 'Send bill PDF', vals: ['AcnooSaleController::store() (app/Http/Controllers/Api/AcnooSaleController.php:69), Sale model', 'New WhatsAppService::sendBill(), new dompdf render, dispatched as a queued job', 'Bill screen: "Send via WhatsApp" button + delivery-status badge', 'New whatsapp_messages row, FK to sales.id', 'Needs a working queue worker (§09)', 'High if the queue gap isn’t fixed first — sends would silently vanish'] },
    { label: 'Payment confirmation', vals: ['Existing gateway callback handlers (Razorpay/Stripe/PayTM/PhonePe/Mollie)', 'Add a WhatsAppService call in each callback, or centralize on Sale.isPaid transition', 'None required for MVP', 'whatsapp_messages row, FK to sales.id', 'Same queue dependency', 'Medium'] },
    { label: 'Pending payment reminder', vals: ['DueCollect, Party::dueForBranch()', 'New scheduled command (needs the scheduler cron fixed, §09)', 'Toggle in WhatsApp settings tab', 'Uses existing whatsapp_messages/opt_ins', 'Same scheduler dependency', 'Medium — also a template-category risk'] },
    { label: 'Bill cancellation notice', vals: ['Sale::update()/destroy() (app/Http/Controllers/Api/AcnooSaleController.php:429,628)', 'Hook a WhatsAppService::sendCancellation() call', 'None required', 'whatsapp_messages row', 'Same queue dependency', 'Low'] },
    { label: 'Customer WhatsApp opt-in', vals: ['Party model', 'Add whatsapp_opt_in, whatsapp_opt_in_at, normalized whatsapp_phone columns', 'Opt-in checkbox on customer/party create-edit form', 'parties migration (additive)', 'None', 'Low'] },
    { label: 'Plan-based message credits/limits', vals: ['Plan, PlanSubscribe, PlanLimitService', 'New whatsapp_message_limit field, checked like customer_limit/user_limit today', 'Plan admin screen gains a WhatsApp row', 'plans migration (additive)', 'None', 'Low — pure repetition of an existing pattern'] },
    { label: 'SaaS-admin monitoring', vals: ['New Admin\\WhatsAppMonitorController', 'Aggregate query across connections/messages', 'New page under existing admin/reports/* convention', 'None beyond §06', 'None', 'Low'] },
    { label: 'Inbound replies / webhook', vals: ['None existing — first webhook consumer in the app', 'New WhatsAppWebhookController, outside auth:sanctum, HMAC-verified', 'Phase 2+ inbox UI', 'whatsapp_webhook_events, status updates', 'Public HTTPS endpoint — confirm nginx/CloudPanel routing and firewall allow it', 'Medium — novel surface, needs its own hardening pass'] },
  ],
};

export const DB_TABLES = [
  {
    name: 'whatsapp_connections', pk: 'id', fks: 'business_id → businesses.id', idx: 'unique(business_id) for MVP',
    purpose: "One row per tenant's WABA — one per business_id for MVP, until multi-number ships in Phase 3.",
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', 'Tenant this WABA belongs to'],
      ['branch_id', 'bigint unsigned', '', 'NULL', 'Phase 3 multi-number support'],
      ['waba_id', 'varchar', '', 'NOT NULL', "Meta's WhatsApp Business Account ID"],
      ['phone_number_id', 'varchar', '', 'NOT NULL', "Meta's phone-number ID"],
      ['display_phone_number', 'varchar', '', 'NOT NULL', 'Shown to customers'],
      ['display_name', 'varchar', '', 'NOT NULL', 'Approved WhatsApp display name'],
      ['access_token_ciphertext', 'text', '', 'NOT NULL', 'Laravel encrypted cast — never plaintext (§11)'],
      ['token_expires_at', 'timestamp', '', 'NULL', 'For proactive re-auth'],
      ['status', 'varchar', '', 'NOT NULL', 'connected / disconnected / revoked / pending_verification'],
      ['quality_rating', 'varchar', '', 'NULL', "Cached from Meta's business_capability_update webhook"],
      ['messaging_limit_tier', 'varchar', '', 'NULL', 'Cached from the same webhook, informational'],
    ],
  },
  {
    name: 'whatsapp_templates', pk: 'id', fks: 'business_id → businesses.id', idx: 'index(business_id, status)',
    purpose: "Mirrors Meta's own template objects so approval status is queryable locally.",
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', 'Owning tenant'],
      ['meta_template_id', 'varchar', '', 'NOT NULL', "Meta's own template id"],
      ['name', 'varchar', '', 'NOT NULL', 'Template name'],
      ['category', 'varchar', '', 'NOT NULL', 'marketing / utility / authentication'],
      ['language', 'varchar', '', 'NOT NULL', 'Template locale'],
      ['status', 'varchar', '', 'NOT NULL', 'pending / approved / rejected / disabled'],
      ['body', 'text', '', 'NOT NULL', 'Approved template copy'],
      ['variables', 'json', '', 'NULL', 'Placeholder variable list'],
      ['rejection_reason', 'text', '', 'NULL', "Meta's stated reason, if rejected"],
    ],
  },
  {
    name: 'whatsapp_opt_ins', pk: 'id', fks: 'business_id → businesses.id, party_id → parties.id (nullable)', idx: 'unique(business_id, phone_e164, channel)',
    purpose: "Kept separate from parties so consent has its own audit trail and can survive a phone-number change.",
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', 'Owning tenant'],
      ['party_id', 'bigint unsigned', '', 'NULL', 'A number can opt in before a Party row exists'],
      ['phone_e164', 'varchar', '', 'NOT NULL', 'Normalized phone number'],
      ['channel', 'varchar', '', 'NOT NULL', 'transactional / marketing — separate consents'],
      ['opted_in_at', 'timestamp', '', 'NOT NULL', ''],
      ['opted_out_at', 'timestamp', '', 'NULL', 'Set automatically on an inbound STOP-style reply'],
      ['source', 'varchar', '', 'NOT NULL', 'checkout / manual / import'],
    ],
  },
  {
    name: 'whatsapp_messages', pk: 'id', fks: 'business_id, branch_id, connection_id, template_id, sale_id, party_id', idx: 'unique(idempotency_key); index(business_id, status)',
    purpose: 'The core send/status ledger.',
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', 'Owning tenant'],
      ['connection_id', 'bigint unsigned', '', 'NOT NULL', 'Which WABA sent/received this'],
      ['sale_id', 'bigint unsigned', '', 'NULL', 'The bill this message is about'],
      ['party_id', 'bigint unsigned', '', 'NULL', 'The customer'],
      ['direction', 'varchar', '', 'NOT NULL', 'outbound / inbound'],
      ['category', 'varchar', '', 'NOT NULL', 'marketing / utility / authentication / service'],
      ['to_phone_e164', 'varchar', '', 'NOT NULL', ''],
      ['meta_message_id', 'varchar', '', 'NULL', "Meta's id, once acked"],
      ['idempotency_key', 'varchar', 'UNI', 'NOT NULL', 'sha256(sale_id : template : phone) — guards against duplicate sends'],
      ['status', 'varchar', '', 'NOT NULL', 'queued / sent / delivered / read / failed'],
      ['error_code', 'varchar', '', 'NULL', ''],
      ['billable', 'boolean', '', 'NOT NULL', "Whether this delivery is expected to be charged, per §02's free-window rules"],
      ['payload', 'json', '', 'NULL', 'Request body actually sent'],
    ],
  },
  {
    name: 'whatsapp_message_attempts', pk: 'id', fks: 'message_id → whatsapp_messages.id', idx: 'index(message_id)',
    purpose: 'Separate from whatsapp_messages so retries don’t overwrite the history of what was tried.',
    cols: [
      ['message_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['attempt_number', 'int', '', 'NOT NULL', ''],
      ['attempted_at', 'timestamp', '', 'NOT NULL', ''],
      ['http_status', 'int', '', 'NULL', ''],
      ['response_body', 'text', '', 'NULL', 'Trimmed, no tokens'],
    ],
  },
  {
    name: 'whatsapp_webhook_events', pk: 'id', fks: 'none', idx: 'unique(meta_event_id)',
    purpose: 'Raw inbound ledger, processed idempotently. The unique index is the retry guard — Meta resends webhooks it doesn’t get a 200 for.',
    cols: [
      ['meta_event_id', 'varchar', 'UNI', 'NOT NULL', "Meta's own id if present, else a hash of the payload"],
      ['waba_id', 'varchar', '', 'NOT NULL', ''],
      ['event_type', 'varchar', '', 'NOT NULL', ''],
      ['payload', 'json', '', 'NOT NULL', ''],
      ['processed_at', 'timestamp', '', 'NULL', ''],
      ['processing_error', 'text', '', 'NULL', ''],
    ],
  },
  {
    name: 'whatsapp_campaigns', pk: 'id', fks: 'business_id, template_id', idx: 'index(business_id, status)',
    purpose: 'Phase 3, marketing only.',
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['template_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['status', 'varchar', '', 'NOT NULL', ''],
      ['scheduled_at', 'timestamp', '', 'NULL', ''],
      ['sent_count', 'int', '', 'NOT NULL', ''],
      ['failed_count', 'int', '', 'NOT NULL', ''],
    ],
  },
  {
    name: 'whatsapp_campaign_recipients', pk: 'id', fks: 'campaign_id, party_id, message_id (once sent)', idx: 'index(campaign_id, status)',
    purpose: 'Kept as its own table rather than reusing whatsapp_messages directly, since a campaign has recipients before it has messages.',
    cols: [
      ['campaign_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['party_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['status', 'varchar', '', 'NOT NULL', ''],
      ['message_id', 'bigint unsigned', '', 'NULL', ''],
    ],
  },
  {
    name: 'whatsapp_usage_counters', pk: 'id', fks: 'business_id → businesses.id', idx: 'unique(business_id, period)',
    purpose: 'For Plan-based limits and the cost dashboard (§10). Incremented from the same job that writes whatsapp_messages, not recomputed by scanning it.',
    cols: [
      ['business_id', 'bigint unsigned', '', 'NOT NULL', ''],
      ['period', 'varchar', '', 'NOT NULL', 'YYYY-MM'],
      ['utility_sent', 'int', '', 'NOT NULL', ''],
      ['marketing_sent', 'int', '', 'NOT NULL', ''],
      ['authentication_sent', 'int', '', 'NOT NULL', ''],
      ['estimated_cost', 'decimal', '', 'NOT NULL', ''],
    ],
  },
];

export const IDEMPOTENCY_NOTES = [
  { t: 'No duplicate bill messages on retry', d: "idempotency_key = sha256(sale_id : template : to_phone_e164), computed before calling Meta; a unique index makes a retried job (queue redelivery, a double-click) a safe no-op, not a second WhatsApp message." },
  { t: 'Webhook retries', d: 'Guarded by whatsapp_webhook_events.meta_event_id uniqueness.' },
  { t: 'Phone-number changes', d: 'whatsapp_opt_ins is keyed to phone_e164, not just party_id — editing Party.phone leaves the old number’s opt-in history untouched and requires a fresh opt-in for the new number, rather than silently carrying consent across.' },
  { t: 'No plaintext long-lived tokens', d: "whatsapp_connections.access_token_ciphertext uses Laravel's encrypted Eloquent cast (backed by APP_KEY), never a raw column." },
  { t: 'Retention', d: 'whatsapp_webhook_events.payload and whatsapp_message_attempts.response_body are the highest-volume, lowest-value-over-time tables — propose 90-day retention, mirroring the discipline already applied to backups (project memory).' },
];

export const QUEUE_NOTE = "QUEUE_CONNECTION=database is fine for WhatsApp sends at any tenant count discussed in §09 — the app is nowhere near a volume that needs a broker. Adding Kafka/RabbitMQ for this would be infrastructure the workload doesn't justify. The actual blocker isn't the driver, it's that nothing currently runs php artisan queue:work (§01) — fix that first (Milestone 0, §13), keep the database driver.";

export const SERVICE_LAYER = [
  { t: 'App\\Services\\WhatsApp\\WhatsAppService', d: 'The single entry point business logic calls (sendBill(), sendPaymentConfirmation(), sendTemplate()) — mirrors how NotificationService already wraps Firebase, a familiar shape in this codebase.' },
  { t: 'App\\Services\\WhatsApp\\Providers\\CloudApiProvider', d: 'Implements a small WhatsAppProviderInterface (send template, upload media, exchange OAuth code) — keeps a future BSP swap (§03, Option C) to one new class, not a rewrite of every call site.' },
  { t: 'Credential resolution is always per-tenant', d: 'Every call resolves the tenant’s whatsapp_connections row by business_id first — there is no shared/global credential path, by construction, so a bug can’t leak one tenant’s send through another tenant’s number.' },
];

export const SENDING_FLOW = [
  { t: 'Trigger point dispatches a queued job', d: 'e.g. AcnooSaleController::store() calls SendWhatsAppBillJob::dispatch($sale) with the domain event, not the message content.' },
  { t: 'The job renders and sends', d: 'Resolves the tenant’s connection + opt-in status, renders the PDF (or signed link), computes the idempotency key (§06), and calls WhatsAppService::sendBill().' },
  { t: 'Retry with backoff', d: "ShouldQueue + Laravel's built-in backoff()/tries; failures beyond the retry budget land in failed_jobs plus a whatsapp_messages.status = failed row for tenant-facing visibility — failed_jobs alone is invisible to a restaurant owner." },
  { t: 'Rate limiting ahead of Meta’s own limit', d: 'A RateLimiter per connection_id, sized conservatively below Meta’s current messaging-limit tier for that WABA, so AppZetBilling backs off before Meta does — not after.' },
];

export const WEBHOOK_PROCESSING = [
  { t: 'New route outside auth:sanctum', d: "POST /webhooks/whatsapp, verifying Meta's X-Hub-Signature-256 HMAC against the app secret before touching the payload — nothing existing to copy, this is genuinely new surface." },
  { t: 'Write first, process later', d: "The handler writes the raw event to whatsapp_webhook_events (idempotent on meta_event_id), returns 200 immediately, then processes (status updates, inbound messages, template_category_update, business_capability_update) in a queued job — never inline in the webhook request." },
  { t: 'Missing local message id is logged, not errored', d: 'An event for a meta_message_id not found locally (can happen on redelivery ordering) is logged and dropped.' },
];

export const ERROR_CLASSIFICATION = [
  { t: 'Invalid/expired token', d: 'Surface as "reconnect WhatsApp" to the tenant, don’t retry.' },
  { t: 'Template not approved', d: 'Surface as a config issue, don’t retry.' },
  { t: 'Rate-limited', d: 'Retry with backoff.' },
  { t: 'Transient network/5xx', d: 'Retry.' },
  { t: 'Invalid recipient number', d: 'Mark opt-in invalid, don’t retry.' },
];

export const ROUTES_TABLE = [
  { m: 'GET', p: '/api/v1/whatsapp/connection', d: "View the tenant's WhatsApp connection status" },
  { m: 'POST', p: '/api/v1/whatsapp/connection', d: 'Complete the Embedded Signup code exchange' },
  { m: 'DELETE', p: '/api/v1/whatsapp/connection', d: 'Disconnect' },
  { m: 'GET', p: '/api/v1/whatsapp/templates{,/{id}}', d: "Read-only mirror of Meta's template state" },
  { m: 'POST', p: '/api/v1/sales/{sale}/whatsapp/send-bill', d: 'Send or resend the bill — idempotent (§06)' },
  { m: 'GET', p: '/api/v1/whatsapp/messages', d: 'Filterable message log (by sale_id, party_id, status)' },
  { m: 'POST', p: '/webhooks/whatsapp', d: "Meta's inbound webhook — signature-verified, outside auth:sanctum" },
  { m: 'GET', p: '/webhooks/whatsapp', d: "Meta's hub.challenge verification handshake" },
];

export const TENANT_DASHBOARD = [
  { t: 'New "WhatsApp" settings tab', d: 'Connect/disconnect button (launches the Embedded Signup widget), connection status, the tenant’s own phone number and display name once connected — alongside the existing admin/settings, admin/business conventions.' },
  { t: 'Template list, read-only for MVP', d: 'Mirrors whatsapp_templates and its approval status — template edits go through Meta’s approval queue and are better managed centrally at first.' },
  { t: 'Per-message-type automatic-send toggles', d: 'Bill PDF, payment confirmation, due reminder — same shape as other tenant-level settings already in admin/manage-settings.' },
  { t: 'Opt-in status on the existing Party edit screen', d: 'Not a separate page.' },
  { t: 'Message history / failed messages list', d: 'Filterable by date and status, reading GET whatsapp/messages.' },
  { t: 'Usage/cost dashboard', d: 'Monthly whatsapp_usage_counters rollup against Plan.whatsapp_message_limit — same visual pattern likely already used for customer_limit/product_limit.' },
  { t: 'Campaign management — Phase 3 only', d: "Don't surface this tab until the marketing opt-in and template-approval work (§04/§11) exist — an empty/broken campaign tab is worse than no tab." },
];

export const BILL_SCREEN_CAVEAT = "The day-to-day POS/billing screen that a restaurant staffer uses to actually create a Sale is not in this repo or on this VPS — the AcnooSaleController naming and the dedicated PosAppInterface model both point to a separate client app that this inspection couldn't reach. Everything below describes the API contract and the pattern to follow; the actual UI work may span two codebases, and the POS client's stack is unknown until someone provides that repo (§14).";

export const BILL_SCREEN = [
  { t: '"Send via WhatsApp" action', d: "Calls POST sales/{sale}/whatsapp/send-bill; disabled (with an explanatory tooltip, not just greyed out) when the Party has no opt-in or no phone number." },
  { t: 'Automatic-send checkbox', d: 'Mirrors the tenant-level toggle but overridable per-bill.' },
  { t: '"Resend" action', d: 'Safe to call repeatedly thanks to the idempotency key — a plain retry button, no special-casing double-sends.' },
  { t: 'Delivery-status badge', d: "queued/sent/delivered/read/failed, reading GET whatsapp/messages?sale_id=, plus the specific error reason from §08's error classification when failed." },
];

export const SAAS_ADMIN = [
  { t: 'Per-tenant connection status and quality rating', d: 'Across the whole platform — lets AppZetBilling spot a tenant about to get throttled (§02) before the tenant notices.' },
  { t: 'Aggregate usage and estimated cost', d: 'For the billing-reconciliation need in §10.' },
  { t: 'Failed-message and provider-error rollup', d: 'An operational health view, not a tenant-facing one.' },
  { t: 'Support tools', d: "View (not edit) a tenant's connection/token status for troubleshooting, without ever displaying the token itself (§11)." },
  { t: 'Audit log', d: 'Connect/disconnect/reconnect events per tenant.' },
];

export const SCALE_100 = [
  { t: '~20,000 messages/day platform-wide', d: 'Assuming 200 bills/day/tenant across 100 tenants — trivially within a 2-vCPU box’s capacity once jobs are actually being processed.' },
  { t: 'Negligible MySQL load', d: 'whatsapp_messages grows by ~600K rows/month — fine with proper indexes (business_id, sale_id, status, created_at), no partitioning needed yet.' },
  { t: 'What’s actually missing: a running queue:work process and a scheduler cron entry', d: "Fix: a Supervisor (or systemd) unit running php artisan queue:work --queue=default,whatsapp --tries=3, plus a single cron line * * * * * php artisan schedule:run — both zero-cost operationally, load-bearing for §08." },
];

export const SCALE_1000 = [
  { t: '~200,000 messages/day', d: 'Same arithmetic scaled 10x — still modest for a queue worker, but now worth 2–3 queue:work processes (Supervisor numprocs) rather than one.' },
  { t: 'Retention job becomes worth doing', d: 'whatsapp_messages at ~6M rows/month is still fine for MySQL with the same indexes, but this is the point to start the retention job (§06) rather than let webhook/attempt tables grow unbounded.' },
  { t: "Meta's own onboarding throttle is the real bottleneck, not the VPS", d: 'Getting AppZetBilling’s Business+App+Access Verification done early (§02) is more urgent than any server upgrade.' },
  { t: 'Object storage becomes worth adding', d: 'Moving generated PDFs to the R2 bucket AppZetBilling already uses for backups avoids local disk growth and gives WhatsApp a stable HTTPS URL for the "secure bill link" feature.' },
];

export const NOT_JUSTIFIED_NOTE = "Not justified by this workload, at either scale: a message broker (Kafka/RabbitMQ), a managed Redis upgrade, a CDN, a separate database, or a load balancer. The one infrastructure item that IS justified regardless of scale is fixing the queue-worker/scheduler gap — it's a correctness fix the app already needed before WhatsApp was on the table.";

export const BILLING_MODELS = [
  { t: 'Model A — tenant pays Meta directly', d: "Falls out naturally from Option B's architecture: the tenant's own Meta Business account holds the payment method. Simplest for AppZetBilling operationally — zero cost-leakage risk — but AppZetBilling earns nothing on messaging and has no lever if a tenant under-provisions their Meta payment method." },
  { t: 'Model B — AppZetBilling pays Meta, charges tenants', d: "Requires AppZetBilling to hold a payment method against a platform-level aggregation of Meta costs. Real risks: cost leakage if usage tracking drifts from Meta's own billing categorization (a poorly-worded reminder template can get reclassified as marketing via template_category_update and change AppZetBilling's own cost basis retroactively), plus tax/processing overhead on what's effectively a pass-through." },
  { t: 'Model C — subscription + usage-based add-on (recommended)', d: "A WhatsApp add-on tier on the existing Plan/PlanSubscribe model — not a new billing system, an extension of the one that already exists. Monthly message credits included per plan tier, consumed from whatsapp_usage_counters; overage billed pay-as-you-go or blocked at the limit, tenant's choice. Separate marketing credits, priced higher, so a tenant's own broadcast campaign can't starve their bill-delivery capacity. No automatic top-up in the MVP — a tenant hitting their limit should see a clear upgrade-or-wait state, not an unexpected charge." },
];

export const WORKED_EXAMPLE = {
  cols: ['Variable', 'Assumed value'],
  rows: [
    { label: 'Active tenants', vals: ['200'] },
    { label: 'Avg. bills/tenant/day', vals: ['40'] },
    { label: '% of bills sent via WhatsApp', vals: ['60%'] },
    { label: 'Resulting utility messages/month', vals: ['200 × 40 × 0.60 × 30 = 144,000'] },
    { label: '% inside a free 24h CSW (illustrative)', vals: ['30% — most bill-sends are business-initiated, so most are not free'] },
    { label: 'Chargeable utility messages/month', vals: ['144,000 × 0.70 ≈ 100,800'] },
    { label: 'Assumed blended utility rate (illustrative, India-weighted)', vals: ['₹1.00/message'] },
    { label: 'Meta cost/month', vals: ['≈ ₹100,800'] },
    { label: 'AppZetBilling infra cost/month (amortized)', vals: ['≈ ₹1,500–2,500 — marginal, the VPS already exists'] },
    { label: 'Included credits at 800/tenant/month', vals: ['160,000 credits — covers the 144,000 sent, no overage in this scenario'] },
    { label: 'Suggested tenant-facing markup over Meta’s raw cost', vals: ['20–35%, a business choice, not derived from Meta data'] },
  ],
};

export const COST_PREVENTION_NOTE = "Preventing one tenant's usage from creating unexpected cost for AppZetBilling: per-tenant whatsapp_message_limit enforced by PlanLimitService-style checks before the job dispatches (not after Meta bills it), a conservative RateLimiter per connection (§08), and marketing messages specifically gated behind an explicit opt-in template review step (§04) since they have zero volume discount and zero free window.";

export const SECURITY_ITEMS = [
  { t: 'Tenant isolation', d: 'Every new table carries business_id; every new model gets the same global-scope treatment as Sale/Party — no controller should ever hand-roll a where(‘business_id’, ...) when the model scope already does it.' },
  { t: 'Access-token encryption', d: 'whatsapp_connections.access_token_ciphertext via Laravel’s encrypted cast, backed by APP_KEY — never a raw column, never logged, never returned by any API response, not even to the SaaS admin dashboard.' },
  { t: 'Secret management', d: "The Meta App's own client secret belongs in .env like every other credential in this app (Stripe, Razorpay, Firebase already work this way)." },
  { t: 'Webhook signature verification', d: 'Mandatory, first thing the handler does, before the payload is parsed or written anywhere.' },
  { t: 'HTTPS', d: 'Already enforced site-wide via the existing Let’s Encrypt/certbot setup; the registered webhook URL must be the same HTTPS domain, no exceptions.' },
  { t: 'Customer consent (opt-in/opt-out)', d: 'whatsapp_opt_ins is the source of truth; every send checks it first, and inbound opt-out keywords must flip opted_out_at automatically — wired into the Phase 2 inbound-message handler from day one.' },
  { t: 'Data retention', d: 'Webhook payloads and attempt logs are the highest-volume, lowest-value-over-time data — 90-day retention proposed, consistent with the R2 backup work already in project memory.' },
  { t: 'Deletion requests', d: "A customer's Party.phone/whatsapp_opt_ins get scrubbed and whatsapp_messages.payload redacted (not the whole row, which is also financial/audit history tied to a Sale)." },
  { t: 'Sensitive bill data / PDF access control', d: 'The "secure bill link" must be a signed, expiring URL, reusing the Business::publicQrUrl() pattern already in the codebase — never a guessable sequential path.' },
  { t: 'Token rotation', d: 'Embedded Signup tokens are customer-scoped and long-lived by design, but should be re-validated periodically so a revoked token surfaces as "reconnect WhatsApp" quickly rather than silently failing sends for days.' },
  { t: 'Staff permissions', d: "Gate 'Send via WhatsApp' and 'WhatsApp Settings' behind the existing dual permission system (Spatie roles + the visibility JSON matrix) rather than inventing a third mechanism." },
  { t: 'Backup encryption', d: 'Already a tracked open item for the platform generally (project memory) — new WhatsApp tables inherit that gap until it’s closed, not a new one this module creates.' },
  { t: 'Production logging', d: 'Never log token values, full webhook payloads with phone numbers at info level, or bill contents — log message IDs, statuses and error codes. Worth revisiting given LOG_LEVEL=debug in production generally.' },
  { t: 'API error handling', d: "Never surface Meta's raw error response to the end tenant — map through the §08 error classification to a human message, log the raw response server-side only." },
];

export const TESTING_ITEMS = [
  { t: 'Unit tests', d: 'WhatsAppService methods against a faked provider interface (no real Meta calls); idempotency-key generation; opt-in/opt-out transitions; template-category safety checks.' },
  { t: 'Integration tests', d: "Against the existing PHPUnit suite (phpunit.xml, tests/ already present) — Sale creation → job dispatched → whatsapp_messages row created, using Laravel's queue fake." },
  { t: 'Webhook tests', d: 'Signed vs. unsigned payloads (reject unsigned), valid status update, malformed payload, and specifically duplicate webhook delivery — same meta_event_id twice, assert only one state transition.' },
  { t: 'Duplicate bill events', d: 'Dispatch the same bill-send job twice; assert exactly one message is actually sent and the second call returns the first attempt’s status.' },
  { t: 'Failed API requests / provider outage', d: 'Mock Meta returning 5xx/timeout; assert retry with backoff and an eventual failed_jobs + whatsapp_messages.status=failed row, not a silent drop.' },
  { t: 'Rate limiting', d: 'Assert the per-connection RateLimiter throttles before Meta’s own limit would, using a tight test-only limit.' },
  { t: 'Token expiration', d: 'Mock an expired/revoked token response; assert the tenant-facing status becomes "reconnect required" rather than a generic failure.' },
  { t: 'Tenant isolation', d: 'The highest-value test class — assert a query scoped to Business A never returns Business B’s rows.' },
  { t: 'Invalid phone numbers', d: 'Malformed input rejected at validation before a job is ever dispatched.' },
  { t: 'Missing customer consent', d: 'Send attempted with no opt-in row — assert it’s blocked server-side even if a client-side check was bypassed.' },
  { t: 'Template rejection', d: 'A rejected template can’t be selected as a send target; a mid-flight category change is picked up on the next send, not cached stale.' },
  { t: 'PDF generation failure', d: 'dompdf throws on malformed data — assert the job fails gracefully into failed_jobs rather than crashing the worker.' },
  { t: 'Queue / database failure', d: 'Simulate the queue table being unreachable; assert bill creation itself still succeeds — a WhatsApp outage must never block the core billing function.' },
  { t: 'Production rollback', d: 'Disabling the WhatsAppAddon module (via modules_statuses.json) must cleanly stop all new behavior without touching Sale/Party/existing billing flows.' },
];

export const SANDBOX_NOTE = "Meta provides a test WhatsApp Business Account and test phone numbers for exactly this purpose. Recommended sequence: build against Meta's test WABA → dogfood with one real, consenting tenant (ideally AppZetBilling's own team) on a real but limited WABA → open to a small opt-in beta of tenants → general availability. Do not skip the single-real-tenant step — sandbox testing won't surface real-world template rejection, real delivery-status timing, or real customer opt-out behavior.";

export const MILESTONES = [
  {
    n: '0', t: 'Fix the queue/scheduler gap (blocks everything else)',
    objective: 'Make QUEUE_CONNECTION=database jobs and Kernel::schedule() commands actually run in production.',
    files: 'None application-level; VPS process config only',
    database: 'None',
    backend: 'None',
    frontend: 'None',
    testing: 'Confirm ingredient:check-low-stock starts firing; confirm a manually-dispatched job actually processes',
    deployment: 'VPS-only change, no app deploy',
    dependencies: 'None — standalone and overdue regardless of WhatsApp',
    rollback: 'Stop/remove the Supervisor unit and cron line; zero app-code risk either way',
  },
  {
    n: '1', t: 'Meta app registration + Embedded Signup (no tenant-facing UI yet)',
    objective: "AppZetBilling registers its Meta Business-type app, requests the two whatsapp_* permissions, implements the Embedded Signup widget end-to-end against Meta's test WABA.",
    files: 'New Modules/WhatsAppAddon skeleton, WhatsAppConnectionController',
    database: 'whatsapp_connections migration (written, not yet run in production)',
    backend: 'OAuth code-exchange, encrypted token storage',
    frontend: 'None yet, or a hidden/internal-only settings tab',
    testing: "Connect/disconnect against Meta's sandbox",
    deployment: 'Staging first',
    dependencies: 'Milestone 0 not strictly required yet, but do it first anyway',
    rollback: 'Module disabled via modules_statuses.json',
  },
  {
    n: '2', t: 'Send bill PDF (the core MVP feature, one real tenant)',
    objective: 'Sale creation → queued job → dompdf render → WhatsApp utility template delivered.',
    files: 'AcnooSaleController::store() gains a dispatch call; new SendWhatsAppBillJob, WhatsAppService',
    database: 'whatsapp_messages, whatsapp_opt_ins, whatsapp_templates migrations',
    backend: 'Full sending flow per §08, error classification, idempotency key',
    frontend: 'Minimal — opt-in checkbox on Party, a basic status indicator',
    testing: 'Full suite from §13 for this path specifically',
    deployment: 'Behind the module flag, enabled only for one pilot tenant',
    dependencies: 'Milestones 0 and 1',
    rollback: 'Disable the module flag for that tenant; Sale creation is untouched if the WhatsApp dispatch is wrapped so a failure never blocks the bill itself',
  },
  {
    n: '3', t: 'Webhooks, delivery status, payment confirmation',
    objective: 'Inbound webhook endpoint live, delivery-status badge accurate, payment-confirmation sends wired into existing gateway callbacks.',
    files: 'WhatsAppWebhookController, gateway callback handlers (Razorpay/Stripe/etc.)',
    database: 'whatsapp_webhook_events, whatsapp_message_attempts',
    backend: 'Per §08',
    frontend: 'Per §09',
    testing: 'Webhook signature + duplicate-delivery tests from §13',
    deployment: 'Production, still pilot-tenant-scoped',
    dependencies: 'Milestone 2',
    rollback: 'Webhook route can be disabled independently of the sending path',
  },
  {
    n: '4', t: 'General availability of MVP feature set',
    objective: 'Cancellation notices, due reminders, self-serve tenant onboarding, Plan-based limits live.',
    files: 'Full §09 tenant dashboard, SaaS-admin monitoring',
    database: 'whatsapp_usage_counters, Plan.whatsapp_message_limit',
    backend: 'Automatic-send rules, limit enforcement',
    frontend: 'Full tenant dashboard + SaaS-admin monitoring',
    testing: 'Load-test the queue worker at the §10 100-tenant estimate',
    deployment: 'Staged rollout, module flag removed once stable',
    dependencies: 'Milestones 0–3, plus AppZetBilling completing Meta Business+App+Access Verification',
    rollback: 'Per-tenant disconnect stays available post-GA; the module flag stays as a platform-wide kill switch',
  },
  {
    n: '5+', t: 'Phase 2/3: inbox, marketing campaigns, multi-number per branch',
    objective: 'Sequenced per §05, each gated behind its own opt-in and cost-visibility prerequisites.',
    files: 'Not scheduled by date — depends on MVP usage data',
    database: '—', backend: '—', frontend: '—', testing: '—', deployment: '—',
    dependencies: 'Real usage data from Milestone 4', rollback: '—',
  },
];

export const FINAL_RECOMMENDATION = [
  { t: 'Build first', d: 'Milestone 0 (queue worker + scheduler cron), then Milestone 1 (Embedded Signup against Meta’s sandbox), then Milestone 2 (bill PDF + payment confirmation for one pilot tenant) — the actual requested use case and nothing more.' },
  { t: 'Postpone', d: 'The shared inbox, marketing campaigns, and any Phase 3 feature — all add real cost/compliance surface the MVP’s usage data hasn’t yet justified building for.' },
  { t: 'Risks to address before implementation', d: 'The queue/scheduler gap; the AcnooInvoiceController::newInvoice() invoice-numbering race condition (not caused by WhatsApp, but would make idempotency keys unreliable under real concurrency); template wording for due/payment reminders, which can get reclassified as marketing and silently change both cost and free-window behavior.' },
  { t: 'Still missing to fully close this plan', d: "The POS client app's source and stack; confirmation of each payment gateway callback's exact method name; real tenant country mix and message volume; whether a Sale refund/void code path exists." },
  { t: 'Is the existing VPS sufficient?', d: 'Yes, at both 100 and 1,000 tenants — the workload is I/O-bound and bursty, not compute-heavy. The binding constraints are Meta’s own onboarding throttle and the queue/scheduler fix, not this VPS’s CPU/RAM/disk.' },
  { t: 'Estimated implementation effort', d: "Milestone 0 is hours, not days. Milestones 1–2 are the bulk of the MVP effort — weeks, driven mostly by Meta's own verification turnaround (2–14 business days) sitting on the critical path more than the code itself. Milestone 3 is smaller and well-scoped once 1–2 exist." },
  { t: 'Does this scale to 1,000+ restaurants?', d: "Yes, architecturally — Option B's per-tenant isolation is exactly what makes 1,000 independent restaurants safe without one bad sender degrading the rest, and the existing business_id-scoped data model needs no rearchitecting. The two real gates at that scale are operational: Meta's onboarding cap and keeping the cost-recovery model accurate." },
];

export const SOURCES = [
  { t: 'Pricing on the WhatsApp Business Platform — Meta for Developers', u: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing', d: 'Fetched in full; per-message pricing since 1 July 2025, categories, CSW, volume tiers, India/Brazil localization dates.' },
  { t: 'Embedded Signup — Meta for Developers', u: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/', d: 'Fetched in full; OAuth flow, Tech Provider permissions, 10→200/week onboarding cap.' },
  { t: 'Template categorization — Meta for Developers', u: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization', d: 'Marketing/utility/authentication categories, template_category_update webhook.' },
  { t: 'Messaging Limits — Meta for Developers', u: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits', d: 'Portfolio-level shared limits since October 2025, tier progression.' },
  { t: 'Media — WhatsApp Cloud API — Meta for Developers', u: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/', d: '100MB document limit.' },
];
