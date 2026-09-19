// TLS certificate runbook — built from a live check of the production VPS on 2026-09-19 and the
// manual renewal actually performed that day. Facts are tagged 'verified' (read directly off the
// server or the live site), 'assumption' (a stated planning input) or 'review' (a decision the
// team has to make). No keys, challenge values or API tokens are recorded here; the real VPS IP
// is masked with the documentation placeholder used elsewhere on this site.

export const LIVE_STATS = [
  { k: 'Certificate expiry (after renewal)', v: '2026-12-18' },
  { k: 'Days of validity issued', v: '90' },
  { k: 'Copies of the cert that matter', v: '2' },
  { k: 'Auto-renewal working today', v: 'No' },
];

export const CURRENT_STATE = [
  { k: 'Covers', v: 'appzetsbilling.com and *.appzetsbilling.com — one wildcard cert backs the root site and every tenant subdomain' },
  { k: 'Issuer / key type', v: "Let's Encrypt, ECDSA" },
  { k: 'Issued / expires', v: 'Renewed 2026-09-19 → expires 2026-12-18 (previous cert issued 2026-06-26, expired 2026-09-24)' },
  { k: 'How it is issued', v: 'certbot with the manual authenticator and DNS-01 challenge (two TXT records under _acme-challenge)' },
  { k: 'DNS host', v: "Hostinger (nameservers byte/pixel.dns-parking.com); the domain is registered at Vercel, which is registrar only" },
  { k: 'Where certbot writes it', v: '/etc/letsencrypt/live/appzetsbilling.com/ (fullchain.pem, privkey.pem, cert.pem, chain.pem)' },
  { k: 'Where Nginx actually reads it', v: '/etc/nginx/ssl-certificates/appzetsbilling.com.crt and .key — CloudPanel’s own copy, referenced by the vhost' },
  { k: 'Renewal hooks', v: 'None — the renewal-hooks/pre, deploy and post folders are empty' },
  { k: 'Renewal timer', v: 'certbot.timer runs daily, but the renewal it attempts cannot complete (see §02)' },
];

export const FINDINGS = [
  { sev: 'crit', t: 'The certificate did not auto-renew', d: "The renewal config uses authenticator = manual with no --manual-auth-hook. Certbot cannot answer a DNS-01 challenge by itself, so every scheduled renewal fails. certbot.timer was firing daily and achieving nothing. Certbot's own output says it: \"This certificate will not be renewed automatically\"." },
  { sev: 'crit', t: 'Earlier docs on this site said the opposite', d: 'The Known Issues and Tech Stack pages previously described renewal as "automated, verified working". That was wrong — the timer and the CloudPanel cron entry exist, but neither can renew a manual-DNS wildcard certificate. Both entries have been corrected; the Gap Analysis had already flagged this as finding S1.' },
  { sev: 'warn', t: 'Renewing in certbot alone changes nothing for visitors', d: "Nginx serves CloudPanel's imported copy, not the files in /etc/letsencrypt. A renewal that stops at certbot leaves the old certificate live until the new one is copied to the Nginx path (or imported through the CloudPanel SSL/TLS form) and Nginx is reloaded." },
  { sev: 'warn', t: 'CloudPanel keeps its own certificate records', d: 'The SSL/TLS tab also lists older entries (an expired Let’s Encrypt cert and a self-signed one, neither installed). They are harmless but can confuse whoever renews next.' },
  { sev: 'info', t: 'A private key was exposed in a screenshot during the renewal', d: 'The key contents were visible in a screenshot shared during the session. Treat that key as exposed: the next renewal issues a fresh key, and the automation should be built so every renewal does.' },
];

export const CERT_FLOW = [
  { t: 'certbot (Let’s Encrypt, DNS-01)', d: 'Proves control of the domain by publishing TXT records at _acme-challenge, then writes the certificate to /etc/letsencrypt/live/appzetsbilling.com/.' },
  { t: 'Copy into CloudPanel’s path', d: 'Today this is a manual step: paste privkey/cert/chain into CloudPanel → Sites → appzetsbilling.com → SSL/TLS → Actions → Import Certificate, or copy the files to /etc/nginx/ssl-certificates/ directly.' },
  { t: 'Nginx vhost', d: 'The CloudPanel vhost points ssl_certificate and ssl_certificate_key at /etc/nginx/ssl-certificates/appzetsbilling.com.{crt,key}. The server_name covers the root domain and *.appzetsbilling.com.' },
  { t: 'Reload Nginx', d: 'nginx -t must pass first, then systemctl reload nginx. Existing connections are not dropped.' },
  { t: 'Laravel tenant routing', d: 'Every tenant subdomain is served by the same certificate and resolved by the ResolveBusiness middleware — so an expired or missing cert breaks every tenant at once, not one.' },
];

export const RENEW_STEPS = [
  { t: '1. Start certbot on the server', d: 'certbot certonly --manual --preferred-challenges dns -d "appzetsbilling.com" -d "*.appzetsbilling.com". It shows the first TXT value and waits at "Press Enter to Continue". Do not press Enter yet.' },
  { t: '2. Add the first TXT record', d: 'In Hostinger DNS add a TXT record named _acme-challenge with the exact value certbot printed (copy from the terminal or /var/log/letsencrypt/letsencrypt.log — do not retype it; several characters look alike). A short TTL such as 60 makes cleanup and retries quicker.' },
  { t: '3. Press Enter, then add the second value', d: 'Certbot moves to the second challenge and prints a second value under the same name. Add it as an additional TXT record — never replace the first. Both must exist at the same time.' },
  { t: '4. Confirm both records are visible', d: 'Query the Hostinger nameservers directly (nslookup -type=TXT _acme-challenge.appzetsbilling.com byte.dns-parking.com, and pixel.dns-parking.com). Both values must appear on both. Only then press Enter for the last time.' },
  { t: '5. Certbot issues the certificate', d: '"Successfully received certificate" with the new expiry date. If it says unauthorized, the records were not visible yet — wait, re-check and run certbot again.' },
  { t: '6. Install it where Nginx reads it', d: "Back up the current /etc/nginx/ssl-certificates/appzetsbilling.com.{crt,key}. Confirm the new key matches the new certificate (compare the public-key hash of each). Install fullchain.pem as the .crt (mode 644) and privkey.pem as the .key (mode 600), run nginx -t, then reload Nginx." },
  { t: '7. Import into CloudPanel', d: 'Sites → appzetsbilling.com → SSL/TLS → Actions → Import Certificate. Private Key = privkey.pem, Certificate = cert.pem only, Chain = the intermediate. Save, and confirm the entry shows Installed: Yes with the new expiry. This keeps CloudPanel from restoring an old copy later.' },
  { t: '8. Delete both _acme-challenge TXT records', d: 'Remove them in Hostinger DNS. Leave every other record alone — especially A @/www/*, MX, SPF/DMARC and the CNAMEs. Then re-query to confirm they are gone.' },
  { t: '9. Verify from outside', d: 'Check the certificate served for the root domain, www and a tenant subdomain (expiry date and HTTP status) — from a machine that is not the server.' },
];

export const GOTCHAS = [
  { t: 'Use cert.pem in the Certificate box, not fullchain.pem', d: 'fullchain.pem is the certificate and the chain joined together; pasting it into the Certificate field duplicates the chain.' },
  { t: 'The CloudPanel form rejected the full chain.pem', d: 'It returned "Certificate Chain: This value is not valid." chain.pem holds three certificates (the intermediate, a root, and a cross-signed root). Paste only the first block — or the first two — with no blank lines, keeping the BEGIN/END lines.' },
  { t: 'Type cat before the path', d: 'Running /etc/letsencrypt/live/…/cert.pem on its own makes the shell try to execute it and fails with "Permission denied". The file is fine; the command was missing.' },
  { t: 'Two TXT values, one name', d: 'Both challenges use the name _acme-challenge. DNS allows this. Adding the second value must not overwrite the first, and both must be live before the final Enter.' },
  { t: 'Check the nameservers, not only your resolver', d: 'A public resolver can return a cached answer. Querying the Hostinger nameservers directly shows what Let’s Encrypt will actually see.' },
  { t: 'Do not paste or screenshot privkey.pem', d: 'Paste it only into the CloudPanel form. Anyone holding it can impersonate every tenant subdomain until the certificate is replaced.' },
];

export const CHECKLIST = [
  { k: 'New expiry on the root domain', v: 'openssl s_client -connect <host>:443 -servername appzetsbilling.com | openssl x509 -noout -dates' },
  { k: 'A tenant subdomain serves the same cert', v: 'Repeat with -servername <any-tenant>.appzetsbilling.com — expiry must match the root' },
  { k: 'Sites still respond', v: 'HTTP 200 on the root and on a tenant subdomain; www returns its normal 301 to the root' },
  { k: 'Nginx file matches', v: 'openssl x509 -in /etc/nginx/ssl-certificates/appzetsbilling.com.crt -noout -enddate' },
  { k: 'CloudPanel entry', v: 'SSL/TLS tab shows the imported cert as Installed: Yes with the new date' },
  { k: 'DNS is clean', v: 'No _acme-challenge TXT records remain on either Hostinger nameserver; A, MX and DMARC unchanged' },
  { k: 'Backup of the previous cert exists', v: 'Files copied to a dated folder under /root before they were overwritten' },
];

export const AUTOMATION_STEPS = [
  { t: 'Auth hook', d: 'A script certbot calls with the domain and challenge value; it adds the _acme-challenge TXT record through the Hostinger DNS API and waits for it to appear on both nameservers. Both wildcard and root challenges land on the same name, so the hook must append, never overwrite.' },
  { t: 'Cleanup hook', d: 'Removes only the _acme-challenge records it created, after validation. It must never touch other records — the same zone holds the root and wildcard A records that every tenant depends on.' },
  { t: 'Deploy hook', d: 'Runs after each successful renewal: verify the new key matches the new cert, back up the current files, install fullchain.pem and privkey.pem into /etc/nginx/ssl-certificates/, run nginx -t, reload Nginx. This is the step the current manual process does by hand.' },
  { t: 'Switch the renewal config', d: 'Change the renewal from the manual authenticator to the hooks, then prove it with certbot renew --dry-run against the Let’s Encrypt staging environment before relying on it.' },
  { t: 'Fresh key every renewal', d: 'Certbot issues a new private key on each renewal unless told to reuse it. Keep that default so an exposed key stops being valid within one cycle.' },
  { t: 'Renewal window', d: 'certbot renews when 30 days remain, so with the current cert an automated attempt would begin around 2026-11-18, well ahead of 2026-12-18.' },
  { t: 'Keep CloudPanel in sync', d: 'The deploy hook writes the files Nginx reads. Re-importing through the CloudPanel form is still worth doing once after the first automated renewal to confirm CloudPanel does not restore an older copy.' },
  { t: 'Alert when it fails', d: 'Send a notification if the hook exits non-zero or the served certificate has fewer than 14 days left. The failure this time was silent for months; monitoring is what makes automation trustworthy.' },
];

export const TLS_ROADMAP = [
  { pri: 'now', t: 'Manual renewal — done 2026-09-19', d: 'New cert live and verified on the root and a tenant subdomain, expiry 2026-12-18. DNS challenge records removed.' },
  { pri: 'now', t: 'Correct the docs that claimed auto-renewal', d: 'Known Issues and Tech Stack now state the real position.' },
  { pri: 'soon', t: 'Create a Hostinger API token for the server', d: 'Needed so the auth/cleanup hooks can write DNS unattended. Created by an account owner and stored on the VPS only, readable by root, never in git.' },
  { pri: 'soon', t: 'Build and test the hooks with a dry run', d: 'Auth, cleanup and deploy hooks per §06, verified with certbot renew --dry-run before switching the real renewal over.' },
  { pri: 'soon', t: 'Add expiry monitoring and alerting', d: 'A daily check of the served certificate that alerts below 14 days, independent of certbot — so a silent failure is caught by something other than the thing that failed.' },
  { pri: 'later', t: 'Tidy CloudPanel’s certificate list', d: 'Remove the expired and self-signed entries so the next person sees one certificate, not three.' },
  { pri: 'later', t: 'Revisit the DNS/registrar split', d: 'Registrar at Vercel, DNS at Hostinger, server at Hostinger. Fine today, but worth documenting who can change which layer.' },
];

export const OPEN_QUESTIONS = [
  { t: 'Who owns the Hostinger API token?', d: 'It can change every DNS record on the domain, not just _acme-challenge. It needs a named owner, a rotation date and a decision about whether a narrower credential is available.' },
  { t: 'Where do expiry alerts go?', d: 'Email, WhatsApp or a chat channel — and to whom. An alert nobody reads repeats the original failure.' },
  { t: 'Is one wildcard cert the right long-term shape?', d: 'It is simple and covers all tenants, but a single expiry affects everyone. Custom tenant domains (My Domains) are a separate matter and are not covered by this certificate.' },
  { t: 'Should CloudPanel stay in the certificate path?', d: 'It adds a second copy that must be kept in sync. Pointing the vhost straight at the certbot files removes the drift risk but changes how CloudPanel manages the site.' },
];
