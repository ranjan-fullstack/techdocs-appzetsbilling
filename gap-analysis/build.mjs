// Builds standalone part pages (parts/NN-*.html) and, with --combine, one combined document.
// Bodies live in src/NN-*.body.html; [[TAG]] shortcodes become evidence badges;
// <!--MATRIX--> is replaced by the master matrix generated from src/matrix.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'src');
// Output goes into the docs site's public/ folder so it ships with the site (Vite copies public/ to dist/).
const outRoot = path.join(dir, '..', 'public', 'reports', 'gap-analysis');
const out = path.join(outRoot, 'parts');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');

const BADGES = {
  V: ['v', 'VERIFIED'], PO: ['po', 'PETPOOJA OFFICIAL'], TP: ['tp', 'THIRD-PARTY'], INF: ['inf', 'INFERENCE'],
  UNK: ['unk', 'UNKNOWN'], MO: ['po', 'META OFFICIAL'], ADD: ['add', 'ADD-ON'], CORE: ['add', 'CORE'], REC: ['inf', 'RECOMMENDED'],
};
const badge = (s) => s.replace(/\[\[([A-Z]+)\]\]/g, (m, k) => (BADGES[k] ? `<span class="b ${BADGES[k][0]}">${BADGES[k][1]}</span>` : m));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CLS = { EXISTING: 's-ex', PARTIAL: 's-pa', 'NOT FOUND': 's-nf', UNKNOWN: 's-unk', NONE: 'g-none', MINOR: 'g-minor', MODERATE: 'g-moderate', MAJOR: 'g-major', CRITICAL: 'g-critical' };

function matrix() {
  const rows = fs.readFileSync(path.join(src, 'matrix.txt'), 'utf8').split('\n')
    .filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('|').map((x) => x.trim()));
  const head = ['Module', 'Feature', 'Petpooja capability (source)', 'AppZetBilling', 'AppZet evidence', 'Gap', 'Dependency', 'Business importance', 'Complexity', 'Phase', 'Recommended approach'];
  const body = rows.map((r) => {
    if (r.length !== 11) throw new Error(`matrix row has ${r.length} cols: ${r.join('|')}`);
    return '<tr>' + r.map((c, i) => `<td class="${[3, 5].includes(i) ? CLS[c.toUpperCase()] || '' : ''}${i === 9 ? ' n' : ''}">${badge(esc(c))}</td>`).join('') + '</tr>';
  }).join('\n');
  return `<div class="toolbar"><input id="q" placeholder="Filter rows (module, feature, status...)" oninput="f()"><select id="st" onchange="f()"><option value="">All AppZet statuses</option><option>EXISTING</option><option>PARTIAL</option><option>NOT FOUND</option><option>UNKNOWN</option></select><select id="gp" onchange="f()"><option value="">All gaps</option><option>NONE</option><option>MINOR</option><option>MODERATE</option><option>MAJOR</option><option>CRITICAL</option></select><span class="sub" id="cnt">${rows.length} rows</span></div><div class="tblw"><table id="mx"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
<script>function f(){var q=document.getElementById('q').value.toLowerCase(),s=document.getElementById('st').value,g=document.getElementById('gp').value,n=0;document.querySelectorAll('#mx tbody tr').forEach(function(r){var t=r.textContent.toLowerCase(),c=r.children,ok=(!q||t.indexOf(q)>-1)&&(!s||c[3].textContent.trim()===s)&&(!g||c[5].textContent.trim()===g);r.style.display=ok?'':'none';if(ok)n++});document.getElementById('cnt').textContent=n+' rows'}</script>`;
}

const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.body\.html$/.test(f)).sort();
const meta = files.map((f) => {
  const html = fs.readFileSync(path.join(src, f), 'utf8');
  const m = html.match(/<!--TITLE:(.*?)-->/);
  return { id: f.replace('.body.html', ''), title: (m ? m[1] : f).trim(), html: html.replace(/<!--TITLE:.*?-->/, '') };
});
const short = (t) => t.split('—')[0].trim();
const render = (h) => badge(h.replace('<!--MATRIX-->', matrix()));
const nav = (cur) => `<nav class="parts">${meta.map((m) => `<a class="${m.id === cur ? 'cur' : ''}" href="${m.id}.html">${short(m.title)}</a>`).join('')}</nav>`;
const shell = (title, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><script>if(window.self!==window.top)document.documentElement.classList.add("embedded")</script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><div class="wrap">${inner}<footer>AppZetBilling vs Petpooja gap analysis - generated ${new Date().toISOString().slice(0, 10)} - analysis only, no production changes were made.</footer></div></body></html>`;

fs.mkdirSync(out, { recursive: true });
for (const m of meta) {
  fs.writeFileSync(path.join(out, m.id + '.html'), shell(m.title, `<header class="top"><div class="k">AppZetBilling gap analysis - part ${m.id.slice(0, 2)} of ${meta.length}</div><h1>${m.title}</h1>${nav(m.id)}</header>${render(m.html)}`));
}
console.log('parts:', meta.length);

if (process.argv.includes('--combine')) {
  const toc = `<nav class="parts">${meta.map((m) => `<a href="#${m.id}">${short(m.title)}</a>`).join('')}</nav>`;
  const secs = meta.map((m, i) => `<section id="${m.id}" class="${i ? 'part-sep' : ''}"><div class="k">PART ${m.id.slice(0, 2)}</div><h1>${m.title}</h1>${render(m.html)}</section>`).join('\n');
  fs.writeFileSync(path.join(outRoot, 'AppZetBilling-Gap-Analysis-Combined.html'), shell('AppZetBilling - Complete Petpooja Gap Analysis',
    `<header class="top"><div class="k">AppZetBilling</div><h1>Complete Petpooja Feature &amp; Integration Gap Analysis + Odisha-First Strategy</h1><p class="sub">Combined report - ${meta.length} parts</p>${toc}</header>${secs}`));
  console.log('combined written');
}
