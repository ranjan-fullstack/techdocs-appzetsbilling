// Every fact here was read directly off the production VPS on 2026-09-14 —
// composer.json / package.json, .env, `php -v`, `nginx -v`, `mysql --version`,
// `git remote -v`, and direct greps for usage — not inferred from the framework name alone.

export const STACK = [
  {
    k: 'runtime',
    title: 'Runtime & server',
    items: [
      { name: 'PHP', ver: '8.4.22', note: 'confirmed via php -v on the VPS' },
      { name: 'Laravel', ver: '10.10', note: 'confirmed in composer.json (laravel/framework)' },
      { name: 'nginx', ver: '1.30.3', note: 'reverse proxy / web server, confirmed via nginx -v' },
      { name: 'Percona MySQL', ver: '8.4.10-10', note: 'InnoDB, utf8mb4_unicode_ci — see DB Architecture' },
      { name: 'Hosting', ver: 'Hostinger VPS · Ubuntu 24.04', note: 'single-box deployment, not containerized' },
    ],
  },
  {
    k: 'modarch',
    title: 'Module architecture',
    items: [
      { name: 'nwidart/laravel-modules', ver: '10.0.6', note: 'each addon is a self-contained package under Modules/' },
      { name: 'HrmAddon', ver: '', note: 'employees/attendance/leave/payroll — verified real migrations+models' },
      { name: 'MultiBranchAddon', ver: '', note: 'branches + BranchScope' },
      { name: 'CashRegisterAddon', ver: '', note: 'register open/close sessions' },
      { name: 'CustomDomainAddon', ver: '', note: 'per-tenant domain mapping' },
      { name: 'InventoryAddon', ver: '', note: 'ingredients/recipes/stock ledger' },
      { name: 'RestaurantOnlineStore', ver: '', note: 'customer-facing storefront + checkout' },
      { name: 'RestaurantWebAddon', ver: '', note: 'public marketing site / CMS' },
    ],
  },
  {
    k: 'frontend',
    title: 'Frontend (admin dashboard)',
    items: [
      { name: 'Blade templates', ver: '', note: 'server-rendered — this is not a SPA' },
      { name: 'jQuery', ver: '3.7.1', note: 'self-hosted in public/, not loaded from a CDN' },
      { name: 'Alpine.js', ver: '3.4', note: 'lightweight in-page interactivity alongside jQuery' },
      { name: 'Tailwind CSS', ver: '3.1', note: 'utility-first styling' },
      { name: 'Vite', ver: '3.0', note: 'asset bundling for the Blade app (unrelated to this docs site’s own Vite)' },
    ],
  },
  {
    k: 'auth',
    title: 'Auth & permissions',
    items: [
      { name: 'Laravel Sanctum', ver: '', note: 'API token auth' },
      { name: 'spatie/laravel-permission', ver: '', note: 'roles/permissions tables — see Finding on how thinly populated model_has_roles is' },
    ],
  },
  {
    k: 'payments',
    title: 'Payment gateways',
    items: [
      { name: 'Stripe', ver: '', note: 'stripe/stripe-php' },
      { name: 'Razorpay', ver: '', note: 'razorpay/razorpay' },
      { name: 'Mollie', ver: '', note: 'mollie/mollie-api-php' },
      { name: 'PayTM', ver: '', note: 'anandsiddharth/laravel-paytm-wallet' },
      { name: 'PhonePe', ver: '', note: 'dipesh79/laravel-phonepe' },
      { name: 'Omnipay', ver: '', note: 'league/omnipay — generic gateway abstraction used alongside the named SDKs above' },
    ],
  },
  {
    k: 'notify',
    title: 'Notifications',
    items: [
      { name: 'kreait/laravel-firebase', ver: '', note: 'FCM push notifications' },
      { name: 'NotificationService::sendPushNotification()', ver: '', note: 'called synchronously inline, not queued — see Known Issues' },
    ],
  },
  {
    k: 'utility',
    title: 'Documents, exports & misc packages',
    items: [
      { name: 'barryvdh/laravel-dompdf', ver: '', note: 'PDF export (invoices, reports)' },
      { name: 'maatwebsite/excel', ver: '', note: 'Excel / CSV export' },
      { name: 'simplesoftwareio/simple-qrcode', ver: '', note: 'per-table QR codes' },
      { name: 'hardevine/shoppingcart', ver: '', note: 'session-based cart — shared identically by Sales/Purchases/Quotations' },
      { name: 'safiull/laravel-installer', ver: '', note: 'self-hosted web installer — typical CodeCanyon-style product packaging' },
    ],
  },
  {
    k: 'infra',
    title: 'Infra configuration (.env, live on the VPS)',
    items: [
      { name: 'CACHE_DRIVER', ver: 'redis', note: 'Redis responds (PONG) but dbsize is 0 right now — only one file in the codebase (app/Helpers/Helper.php) actually calls Cache::, so it’s barely exercised' },
      { name: 'QUEUE_CONNECTION', ver: 'database', note: 'but no queue worker process is running — see Known Issues' },
      { name: 'SESSION_DRIVER', ver: 'file', note: 'sessions on local disk, not shared/cached' },
      { name: 'MAIL_MAILER', ver: 'smtp', note: '' },
      { name: 'FILESYSTEM_DISK', ver: 'public (local)', note: 'no public/storage symlink exists — confirmed not a bug: uploads go straight to public/uploads/ instead, this convention is simply unused' },
      { name: 'BROADCAST_DRIVER', ver: 'pusher', note: 'credentials are empty and zero ShouldBroadcast/broadcast() calls exist anywhere — entirely dead configuration' },
      { name: 'LOG_CHANNEL / LOG_LEVEL', ver: 'stack (single) / debug', note: 'one ever-growing storage/logs/laravel.log — see Known Issues' },
      { name: 'CORS allowed_origins', ver: "['*']", note: 'wildcard — see Known Issues' },
      { name: 'config:cache / route:cache', ver: 'never run', note: 'bootstrap/cache/ only holds the auto-generated module manifests' },
    ],
  },
  {
    k: 'security',
    title: 'Security & network',
    items: [
      { name: 'ufw firewall', ver: 'active', note: 'default deny incoming; allows 22, 80, 443 (+ udp), and 8443 (CloudPanel’s own admin UI)' },
      { name: 'fail2ban', ver: 'active', note: 'one jail: sshd' },
      { name: 'SSH root login', ver: 'PermitRootLogin yes + PasswordAuthentication yes', note: 'password-guessable, not keys-only — see Known Issues' },
      { name: 'TLS', ver: "Let's Encrypt ECDSA, appzetsbilling.com + *.appzetsbilling.com", note: 'wildcard cert backs every tenant custom subdomain; HTTP/3 (QUIC) enabled' },
      { name: 'Certificate renewal', ver: 'automated, verified working', note: 'both a systemd certbot.timer and a CloudPanel cron entry trigger it independently' },
    ],
  },
  {
    k: 'ops',
    title: 'Hosting & operations',
    items: [
      { name: 'Control panel', ver: 'CloudPanel (clpctl)', note: "the VPS's actual hosting-panel layer — provisions the daily DB backups, TLS renewal, and an (unused, for this app) Varnish instance" },
      { name: 'Database backups', ver: 'daily, automated, gzipped', note: '7-day retention via clpctl db:backup — verified real dated files on disk, not just configured' },
      { name: 'Request path', ver: 'nginx (443/80) → nginx (8080) → php-fpm (17001)', note: 'Varnish (port 6081) is installed and running but not in this chain' },
      { name: 'PHP-FPM', ver: 'pm=ondemand, max_children=250', note: 'memory_limit 768M, upload_max_filesize 2G, opcache on, timezone Europe/Berlin' },
      { name: 'Server', ver: '2 vCPU, 7.8GB RAM, 96GB disk (10% used)', note: 'Hostinger VPS, Ubuntu 24.04.4 LTS' },
    ],
  },
  {
    k: 'deploy',
    title: 'Source control & deployment',
    items: [
      { name: 'Git', ver: 'single main branch', note: 'remote: github.com/ranjan-fullstack/appzetbilling — real history, not a fresh scaffold' },
      { name: 'Deployment model', ver: 'single VPS, no containers', note: 'no CI/CD pipeline found; the app itself runs under nginx+php-fpm with no dedicated systemd service of its own' },
    ],
  },
];
