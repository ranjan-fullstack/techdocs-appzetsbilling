// Builds standalone part pages (parts/NN-*.html) and, with --combine, one combined document.
// Bodies live in src/NN-*.body.html; [[TAG]] shortcodes become evidence badges.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'src');
const outRoot = path.join(dir, '..', 'public', 'reports', 'salepro-analysis');
const out = path.join(outRoot, 'parts');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');

const BADGES = {
  V: ['v', 'VERIFIED FACT'], TP: ['tp', 'THIRD-PARTY'], EST: ['inf', 'ESTIMATE'], ASM: ['unk', 'ASSUMPTION'],
  REC: ['add', 'RECOMMENDATION'], UNK: ['unk', 'UNKNOWN'], INF: ['inf', 'INFERENCE'],
};
const badge = (s) => s.replace(/\[\[([A-Z]+)\]\]/g, (m, k) => (BADGES[k] ? `<span class="b ${BADGES[k][0]}">${BADGES[k][1]}</span>` : m));

const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.body\.html$/.test(f)).sort();
const meta = files.map((f) => {
  const html = fs.readFileSync(path.join(src, f), 'utf8');
  const m = html.match(/<!--TITLE:(.*?)-->/);
  return { id: f.replace('.body.html', ''), title: (m ? m[1] : f).trim(), html: html.replace(/<!--TITLE:.*?-->/, '') };
});
const short = (t) => t.split('—')[0].trim();
const nav = (cur) => `<nav class="parts">${meta.map((m) => `<a class="${m.id === cur ? 'cur' : ''}" href="${m.id}.html">${short(m.title)}</a>`).join('')}</nav>`;
const shell = (title, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><script>if(window.self!==window.top)document.documentElement.classList.add("embedded")</script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><div class="wrap">${inner}<footer>SalePro + SalePro SaaS due-diligence analysis - generated ${new Date().toISOString().slice(0, 10)} - research only; nothing was purchased or installed.</footer></div></body></html>`;

fs.mkdirSync(out, { recursive: true });
for (const m of meta) {
  fs.writeFileSync(path.join(out, m.id + '.html'), shell(m.title, `<header class="top"><div class="k">SalePro due diligence - part ${m.id.slice(0, 2)} of ${meta.length}</div><h1>${m.title}</h1>${nav(m.id)}</header>${badge(m.html)}`));
}
console.log('parts:', meta.length);

if (process.argv.includes('--combine')) {
  const toc = `<nav class="parts">${meta.map((m) => `<a href="#${m.id}">${short(m.title)}</a>`).join('')}</nav>`;
  const secs = meta.map((m, i) => `<section id="${m.id}" class="${i ? 'part-sep' : ''}"><div class="k">PART ${m.id.slice(0, 2)}</div><h1>${m.title}</h1>${badge(m.html)}</section>`).join('\n');
  fs.writeFileSync(path.join(outRoot, 'SalePro-SaaS-Due-Diligence-Combined.html'), shell('SalePro + SalePro SaaS - Due Diligence',
    `<header class="top"><div class="k">Due diligence</div><h1>SalePro + SalePro SaaS - Business, Technical, Pricing &amp; Market Feasibility</h1><p class="sub">Combined report - ${meta.length} parts</p>${toc}</header>${secs}`));
  console.log('combined written');
}
