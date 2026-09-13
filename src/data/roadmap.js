// Recommendations synthesized from everything verified across the DB Architecture and
// Application Flow docs. Each item names the finding(s) it comes from rather than
// restating their detail — see Known Issues / DB Architecture §06 for the underlying evidence.

export const ROADMAP = [
  {
    pri: 'now',
    t: 'Fix the reservation plan-gate key mismatch',
    d: "'reservation' (singular) is saved by the plan-edit form but 'reservations' (plural) is what the code checks — every business with reservations toggled on is silently blocked. One-line fix, high customer-facing impact.",
    findings: [],
  },
  {
    pri: 'now',
    t: 'Add the missing cron line so the scheduler actually runs',
    d: 'A single `* * * * * php artisan schedule:run` cron entry on the VPS activates every scheduled command at once — right now low-stock alerting is fully built but has never fired.',
    findings: [],
  },
  {
    pri: 'now',
    t: 'Make online-store checkout deduct ingredient stock',
    d: 'AcnooCheckoutController::createSale() needs the same StockService::processSale() call AcnooSaleController::store() already makes, or recipe-tracked stock silently drifts between the two sales channels.',
    findings: [],
  },
  {
    pri: 'soon',
    t: 'Unify POS and online-store sale creation into one shared service',
    d: 'Two hand-copied implementations of "turn a cart into a sale" means every future change (like the stock-deduction fix above) has to be made twice, correctly, in both places. Extracting one SaleService both controllers call removes that risk permanently.',
    findings: [],
  },
  {
    pri: 'soon',
    t: 'Decide: run a queue worker, or stop marking jobs as queued',
    d: 'QUEUE_CONNECTION=database with no worker process means any future ShouldQueue job (or SendPushNotificationJob, if it’s ever actually dispatched) will queue forever and never run. Either add a supervised queue:work process, or send notifications synchronously on purpose and remove the ShouldQueue implementation to stop the config lying about what happens.',
    findings: [],
  },
  {
    pri: 'soon',
    t: 'Un-couple Roles & Permissions from the Branches plan module',
    d: 'business.roles.* routes are gated under the \'branches\' available_modules key with no branches feature relationship. A shop-owner who never buys the multi-branch add-on cannot manage their own staff roles.',
    findings: [],
  },
  {
    pri: 'later',
    t: 'Fix the sales.billing_address_id foreign key',
    d: "It currently references sales.id (a self-reference) instead of billing_addresses.id. A migration fix already exists in this documentation effort but was never applied to production — needs a go-ahead and a maintenance window.",
    findings: [],
  },
  {
    pri: 'later',
    t: 'Remove or finish dead code found during this audit',
    d: 'SaleObserver is defined but never registered; SendPushNotificationJob is defined but never dispatched. Both read as unfinished work rather than intentional design — either wire them in or delete them so the codebase doesn’t mislead the next developer who greps for them.',
    findings: [],
  },
  {
    pri: 'later',
    t: 'Add automated tests around the flows this documentation traced',
    d: 'None were found in the repo for the core Sales/Purchases/Quotations/Stock flows. Given how much of this audit consisted of hand-tracing controller logic to find real bugs (the reservation key mismatch, the stock-deduction gap), a handful of feature tests over exactly those flows would catch regressions this documentation currently catches by inspection alone.',
    findings: [],
  },
  {
    pri: 'later',
    t: 'Add tenant-scoped uniqueness to coupons.code and parties.phone',
    d: 'Both are globally UNIQUE despite being tenant-owned data, so two businesses cannot independently reuse the same coupon code or contact phone number. Needs a composite (business_id, code) / (business_id, phone) unique index instead.',
    findings: [],
  },
  {
    pri: 'soon',
    t: 'Disable SSH password authentication for root',
    d: "PermitRootLogin yes plus PasswordAuthentication yes together mean a guessed root password is still a valid way in, fail2ban's throttling aside. Switching to PermitRootLogin prohibit-password (keys only) is a one-line sshd_config change with no application impact.",
    findings: [],
  },
  {
    pri: 'soon',
    t: "Switch Laravel's log channel to daily and drop the level in production",
    d: "storage/logs/laravel.log is a single ever-growing file at LOG_LEVEL=debug, and the box's OS-level logrotate doesn't cover it (it only rotates the separate nginx/php/varnish log directory). Changing LOG_CHANNEL to 'daily' and LOG_LEVEL to something like 'warning' or 'error' is a .env change, not a code change.",
    findings: [],
  },
  {
    pri: 'later',
    t: 'Turn on config:cache and route:cache for production deploys',
    d: 'Neither has ever been run — bootstrap/cache/ only has the module manifests nwidart/laravel-modules generates automatically. Adding both to the deploy process means every request stops re-parsing every config file and re-registering every route from scratch.',
    findings: [],
  },
  {
    pri: 'later',
    t: 'Either wire Varnish into the request path or stop paying for it',
    d: "It's running (CloudPanel provisioned it) but this site's nginx vhost never proxies through it. Either put it in front of the app for the cacheable public/storefront routes, or leave it off deliberately rather than by accident.",
    findings: [],
  },
];

export const PRI_LABEL = { now: 'Do now', soon: 'Do soon', later: 'Worth planning' };
