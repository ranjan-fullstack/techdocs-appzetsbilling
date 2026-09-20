// Builds the single printer-analysis report: src/printer-analysis.body.html -> public/reports/printer-analysis/printer-analysis.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(dir, 'src', 'style.css'), 'utf8');
const BADGES = { V: ['v', 'VERIFIED FACT'], TP: ['tp', 'THIRD-PARTY'], EST: ['inf', 'ESTIMATE'], INF: ['inf', 'INFERENCE'], UNK: ['unk', 'UNKNOWN'], REC: ['add', 'RECOMMENDATION'] };
const badge = (s) => s.replace(/\[\[([A-Z]+)\]\]/g, (m, k) => (BADGES[k] ? `<span class="b ${BADGES[k][0]}">${BADGES[k][1]}</span>` : m));
const raw = fs.readFileSync(path.join(dir, 'src', 'printer-analysis.body.html'), 'utf8');
const title = (raw.match(/<!--TITLE:(.*?)-->/) || [, 'Printer Analysis'])[1].trim();
const body = raw.replace(/<!--TITLE:.*?-->/, '');
const out = path.join(dir, '..', 'public', 'reports', 'printer-analysis');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'printer-analysis.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><script>if(window.self!==window.top)document.documentElement.classList.add("embedded")</script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><div class="wrap"><header class="top"><div class="k">AppZetBilling</div><h1>${title}</h1></header>${badge(body)}<footer>Printer analysis - generated ${new Date().toISOString().slice(0, 10)} - read-only research; nothing on the server was changed.</footer></div></body></html>`);
console.log('written');
